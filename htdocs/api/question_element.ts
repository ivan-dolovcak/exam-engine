import { saveAnswersLocal } from "./generate_document.js";

/** Question object extracted from the document JSON. */
export interface IQuestionData
{
    id: string,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    answers?: string[],
    size?: [number, number]
}

export interface IAnswer
{
    id: string,
    value: string | string[] | null
}

export abstract class QuestionElement extends HTMLDivElement
{
    protected questionJSONData: IQuestionData;
    protected inputsDiv: HTMLDivElement;
    protected answer: IAnswer;

    set headerTitle(title: string)
    {
        const titleEl
            = this.getElementsByClassName("title")[0] as HTMLHeadingElement;
        titleEl.innerText = title;
        this.questionJSONData.title = title;
    }

    constructor(questionJSONData: IQuestionData, answer: IAnswer)
    {
        super();
        this.questionJSONData = questionJSONData;
        this.answer = answer;
   
        // Create question box from HTML template:
        const questionTemplate = document.getElementById(
            "question-template") as HTMLTemplateElement;
        const questionHTML: DocumentFragment = questionTemplate.content;
        this.appendChild(questionHTML.cloneNode(true));
        this.classList.add("question");

        this.inputsDiv
            = this.getElementsByClassName("inputs")[0] as HTMLDivElement;

        this.headerTitle = this.questionJSONData.title;
    }

    connectedCallback()
    {
        const inputs: NodeListOf<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>
            = this.inputsDiv.querySelectorAll("input, textarea, select");
        
        for (const input of inputs)
            input.addEventListener("blur",
                () => { this.saveAnswer(); saveAnswersLocal(); });

        if (this.answer.value !== null)
            this.loadAnswer();
    }

    abstract saveAnswer(): void;
    abstract loadAnswer(): void;

    static generate(question: IQuestionData, answer: IAnswer)
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


    constructor(questionJSONData: IQuestionData, answer: IAnswer)
    {
        super(questionJSONData, answer);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.setAttribute("autocomplete", "off");
        this.input.name = this.questionJSONData.id.toString();
        this.inputsDiv.appendChild(this.input);
    }

    saveAnswer(): void
    {
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


    constructor(questionJSONData: IQuestionData, answer: IAnswer)
    {
        super(questionJSONData, answer);

        this.input = document.createElement("textarea");
        this.input.rows = this.questionJSONData.size![1];
        this.input.cols = this.questionJSONData.size![0];
        this.input.spellcheck = false;
        this.input.name = this.questionJSONData.id.toString();
        this.inputsDiv.appendChild(this.input);
    }

    saveAnswer(): void
    {
        this.answer.value = this.input.value;
    }
    loadAnswer(): void
    {
        this.input.value = this.answer.value as string;
    }
}

export class MultiChoice extends QuestionElement
{
    constructor(questionJSONData: IQuestionData, answer: IAnswer)
    {
        super(questionJSONData, answer);

        let offeredAnswers;
        if (this.questionJSONData.type === "trueFalse")
            offeredAnswers = ["točno", "netočno"];
        else
            offeredAnswers = this.questionJSONData.answers!;

        for (const offeredAnswer of offeredAnswers) {
            const radioContainer = document.createElement("label");
            radioContainer.classList.add("multi-container");
            radioContainer.innerText = offeredAnswer;
            const randomID: number = Math.floor(Math.random() * 1000);
            radioContainer.htmlFor = this.questionJSONData.id.toString() + randomID;
            this.inputsDiv.appendChild(radioContainer);

            const radioBtn = document.createElement("input");
            // The only difference for multiChoice is to use checkboxes:
            if (this.questionJSONData.type === "multiChoice")
                radioBtn.type = "checkbox";
            else
                radioBtn.type = "radio";

            radioBtn.value = offeredAnswer;
            radioBtn.name = this.questionJSONData.id.toString();
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
        
        if (this.questionJSONData.type === "singleChoice")
            this.answer.value = this.answer.value[0] ?? null;
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
    constructor(questionJSONData: IQuestionData, answer: IAnswer)
    {
        super(questionJSONData, answer);

        const partialText = document.createElement("p");
        partialText.innerText = this.questionJSONData.partialText!;
        partialText.innerHTML = partialText.innerHTML.replace(
            /\u200e/g, `<input name="${this.questionJSONData.id}?" type="text" autocomplete="off">`);
        
        this.inputsDiv.appendChild(partialText);
    }

    saveAnswer(): void
    {
        this.answer.value = [];
        for (const input of this.inputsDiv.getElementsByTagName("input"))
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
