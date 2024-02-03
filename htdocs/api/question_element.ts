import { documentMetadata, saveAnswersLocal } from "./generate_document.js";

/** Every question element has this data object bound to it. */
export interface IQuestionData
{
    ID: number,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    offeredAnswers?: string[],
    needsManualGrading?: boolean
}

export interface IAnswerData
{
    ID: number,
    value: string | (string | null)[] | null
}

export abstract class QuestionElement extends HTMLDivElement
{
    protected data: IQuestionData;
    protected inputsDiv: HTMLDivElement;
    protected answer: IAnswerData;


    abstract saveAnswer(): void;
    abstract loadAnswer(): void;

    set headerTitle(title: string)
    {
        const titleEl
            = this.getElementsByClassName("title")[0] as HTMLHeadingElement;
        titleEl.innerText = title;
        this.data.title = title;
    }

    constructor(data: IQuestionData, answer: IAnswerData)
    {
        super();
        this.data = data;
        this.answer = answer;
   
        // Create question box from HTML template.
        const questionTemplate = document.getElementById(
            "question-template") as HTMLTemplateElement;
        const questionHTML: DocumentFragment = questionTemplate.content;
        this.appendChild(questionHTML.cloneNode(true));
        this.classList.add("question");

        this.inputsDiv
            = this.getElementsByClassName("inputs")[0] as HTMLDivElement;

        this.headerTitle = this.data.title;
    }

    connectedCallback()
    {
        type InputLike
            = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const inputs: NodeListOf<InputLike>
            = this.inputsDiv.querySelectorAll("input, textarea, select");
        
        // Add autosave to all inputs.
        if (documentMetadata.generatingMode !== "review")
            for (const input of inputs)
                input.addEventListener("blur", () => {
                    this.saveAnswer(); saveAnswersLocal();
                });
        
        // Deny user input when reviewing.
        if (documentMetadata.generatingMode === "review")
            for (const input of inputs) {
                input.disabled = true;
                // Disable hover:
                input.parentElement?.style.setProperty("cursor", "default");
            }

        // Fill questions with user answers.
        if (this.answer.value !== null)
            this.loadAnswer();
    }

    /** Uses a corresponding constructor for the question type. */
    static generate(question: IQuestionData, answer: IAnswerData)
        : QuestionElement | undefined
    {
        let questionElement: QuestionElement | undefined;

        switch (question.type) {
        case "shortAnswer":
            questionElement = new ShortAnswer(question, answer);
            break;
        case "singleChoice": case "multiChoice": case "trueFalse":
            questionElement = new MultiChoice(question, answer);
            break;
        case "longAnswer":
            questionElement = new LongAnswer(question, answer);
            break;
        case "fillIn":
            questionElement = new FillIn(question, answer);
        }
        
        return questionElement;
    }
}

export class ShortAnswer extends QuestionElement
{
    private input: HTMLInputElement;


    constructor(data: IQuestionData, answer: IAnswerData)
    {
        super(data, answer);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.autocomplete = "off";
        this.input.spellcheck = false;
        this.input.name = this.data.ID.toString();
        this.inputsDiv.appendChild(this.input);
    }

    saveAnswer(): void
    {
        if (! this.input.value)
            this.answer.value = null;
        else
            this.answer.value = this.input.value;
    }

    loadAnswer(): void
    {
        this.input.value = this.answer.value as string;
    }
}

export class LongAnswer extends QuestionElement
{
    private input: HTMLTextAreaElement;


    constructor(data: IQuestionData, answer: IAnswerData)
    {
        super(data, answer);

        this.input = document.createElement("textarea");
        this.input.spellcheck = false;
        this.input.name = this.data.ID.toString();
        this.inputsDiv.appendChild(this.input);
    }

    saveAnswer(): void
    {
        if (! this.input.value)
            this.answer.value = null;
        else
            this.answer.value = this.input.value;
    }

    loadAnswer(): void
    {
        this.input.value = this.answer.value as string;
    }
}

export class MultiChoice extends QuestionElement
{
    constructor(data: IQuestionData, answer: IAnswerData)
    {
        super(data, answer);

        let offeredAnswers;
        if (this.data.type === "trueFalse")
            offeredAnswers = ["točno", "netočno"];
        else
            offeredAnswers = this.data.offeredAnswers!;

        for (const offeredAnswer of offeredAnswers) {
            // Custom checkbox/radiobutton generation.

            const radioContainer = document.createElement("label");
            radioContainer.classList.add("multi-container");
            radioContainer.innerText = offeredAnswer;
            radioContainer.htmlFor = this.data.ID.toString() + Math.random();
            this.inputsDiv.appendChild(radioContainer);

            const radioBtn = document.createElement("input");
            // The only difference for multiChoice is to use checkboxes:
            if (this.data.type === "multiChoice")
                radioBtn.type = "checkbox";
            else
                radioBtn.type = "radio";

            radioBtn.value = offeredAnswer;
            radioBtn.name = this.data.ID.toString();
            radioBtn.id = radioContainer.htmlFor;
            radioContainer.appendChild(radioBtn);

            const checkmark: HTMLSpanElement = document.createElement("span");
            checkmark.classList.add(radioBtn.type);
            radioContainer.appendChild(checkmark);
        }
    }

    saveAnswer(): void
    {
        this.answer.value = [];
        for (const radioBtn of this.inputsDiv.getElementsByTagName("input"))
            if (radioBtn.checked)
                this.answer.value.push(radioBtn.value);
        
        if (this.data.type !== "multiChoice")
            this.answer.value = this.answer.value[0] ?? null;
        if (Array.isArray(this.answer.value) && this.answer.value.length === 0)
            this.answer.value = null;
    }

    loadAnswer(): void
    {
        let answer = this.answer.value;
        if (! Array.isArray(answer))
            answer = [answer!];
        for (const radioBtn of this.inputsDiv.getElementsByTagName("input"))
            if (answer.includes(radioBtn.value))
                radioBtn.checked = true;
            
    }
}

export class FillIn extends QuestionElement
{
    constructor(data: IQuestionData, answer: IAnswerData)
    {
        super(data, answer);

        const partialText = document.createElement("div");
        const textFragments: string[]
            = this.data.partialText!.split("\u200e");
        
        for (const textFragment of textFragments) {
            const textFragmentEl = document.createElement("span");
            textFragmentEl.innerText = textFragment;
            partialText.appendChild(textFragmentEl);

            const input = document.createElement("input");
            input.type = "text";
            input.name = this.data.ID.toString();
            input.spellcheck = false;
            input.autocomplete = "off";
            partialText.appendChild(input);
        }

        partialText.lastChild?.remove();
        
        this.inputsDiv.appendChild(partialText);
    }

    saveAnswer(): void
    {
        this.answer.value = [];
        for (const input of this.inputsDiv.getElementsByTagName("input"))
            if (! input.value)
                this.answer.value.push(null);
            else
                this.answer.value.push(input.value);

        if (this.answer.value.length === 0)
            this.answer.value = null;
    }

    loadAnswer(): void
    {
        const inputs = this.inputsDiv.getElementsByTagName("input");
        for (let i = 0; i < inputs.length; ++i) {
            inputs[i].value = (this.answer.value as string[])[i];
        }
    }
}

customElements.define("short-answer", ShortAnswer, { extends: "div" });
customElements.define("single-choice", MultiChoice, { extends: "div" });
customElements.define("long-answer", LongAnswer, { extends: "div" });
customElements.define("fill-in", FillIn, { extends: "div" });
