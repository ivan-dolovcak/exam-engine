import { documentMetadata, IGradingData, saveAnswersLocal, solutions, generateNewQuestionBtn, saveQuestion } from "./generate_document.js";

/** Every question element has this data object bound to it. */
export interface IQuestionData
{
    ID: number,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    offeredAnswers?: string[],
    needsManualGrading?: boolean,
    required?: boolean,
    points: number,
}

export interface IAnswerData
{
    ID: number,
    value: string | (string | null)[] | null,
}

export abstract class QuestionElement extends HTMLDivElement
{
    public data: IQuestionData;
    protected answer: IAnswerData;
    protected grade: IGradingData | undefined;
    protected solution: IAnswerData;
    protected inputsDiv: HTMLDivElement;
    protected titleEl: HTMLHeadElement;

    abstract saveAnswer(): void;
    abstract loadAnswer(): void;
    abstract showSolution(): void;


    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super();
        this.data = data;
        this.answer = answer;
        this.grade = grade;

        this.solution = solutions!.find(solution => solution.ID === this.data.ID)!;
   
        // Create question box from HTML template.
        const questionTemplate = document.getElementById(
            "question-template") as HTMLTemplateElement;
        const questionHTML: DocumentFragment = questionTemplate.content;
        this.appendChild(questionHTML.cloneNode(true));
        this.classList.add("question");

        this.inputsDiv
            = this.getElementsByClassName("inputs")[0] as HTMLDivElement;
        
        this.titleEl
            = this.getElementsByClassName("title")[0] as HTMLHeadingElement;
        this.titleEl.innerText = this.data.title;

        // Add total points
        const gradeDiv
            = this.getElementsByClassName("grade")[0] as HTMLDivElement;
        
        if (documentMetadata.generatingMode === "review")
            gradeDiv.innerText = (grade?.points ?? "?") + " / " + data.points;
        else
            gradeDiv.innerText = "_ / " + data.points;

        if (documentMetadata.generatingMode === "review") {
            // Add points (grades)
            switch (this.grade?.points) {
            case this.data.points:
                this.classList.add("correct");
                break;
            case undefined:
                this.classList.add("manual");
                break;
            case null:
                this.classList.add("unanswered");
                this.grade.points = 0;
                break;
            default:
                if (this.grade!.points <= 0)
                    this.classList.add("incorrect");
                else
                    this.classList.add("partially");
            }
        }
        else if (documentMetadata.generatingMode === "edit") {
            // Create editable title
            this.titleEl.addEventListener("click", () => {
                this.titleEl.contentEditable = "true";
                this.titleEl.focus();
            });
            this.titleEl.addEventListener("blur", () => {
                this.data.title = this.titleEl.innerText;
                saveQuestion(this.data);
            });
        }
    }

    connectedCallback()
    {
        // Calculate ordinal
        if (this.data.ordinal === -1) {
            const nextSib: Element | null = this.nextElementSibling;
            const prevSib: Element | null = this.previousElementSibling;
            console.log(nextSib)

            
            if (! prevSib) // Top (has to be positive)
                this.data.ordinal = (nextSib as QuestionElement).data.ordinal / 2;
            else if (! nextSib) // Bottom
                this.data.ordinal = (prevSib as QuestionElement).data.ordinal + 1;
            else // Middle (take avg)
                this.data.ordinal = (
                    (prevSib as QuestionElement).data.ordinal
                    + (nextSib as QuestionElement).data.ordinal) / 2;
        }

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
        
        // Fill questions with user answers.
        if (this.answer.value !== null)
            this.loadAnswer();
        
        if (documentMetadata.generatingMode === "review") {
            if (solutions !== null)
                this.showSolution();

            // Deny user input when reviewing.
            for (const input of inputs) {
                input.disabled = true;
                // Disable hover:
                input.parentElement?.style.setProperty("cursor", "default");
            }
        }

        // In edit mode, all correct answers must exist (except for optional
        // questions.)
        if (documentMetadata.generatingMode === "edit" && this.data.required) {
            for (const input of inputs)
                input.required = true;
        }

        if (documentMetadata.generatingMode !== "edit")
            return;
        // Generate "new question" button(s):
        if (this.previousElementSibling instanceof QuestionElement
            || this.previousElementSibling === null)
            this.parentElement!.insertBefore(generateNewQuestionBtn(), this);
        if (this.nextElementSibling instanceof QuestionElement)
            this.parentElement!.insertBefore(generateNewQuestionBtn(), this.nextElementSibling);
            
        if (this.parentElement!.lastElementChild instanceof QuestionElement)
            this.parentElement?.appendChild(generateNewQuestionBtn());
    }

    /** Uses a corresponding ctor for the question type. */
    static generate(question: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
        : QuestionElement | undefined
    {
        let questionElement: QuestionElement | undefined;

        switch (question.type) {
        case "shortAnswer":
            questionElement = new ShortAnswer(question, answer, grade);
            break;
        case "singleChoice": case "multiChoice": case "trueFalse":
            questionElement = new MultiChoice(question, answer, grade);
            break;
        case "longAnswer":
            questionElement = new LongAnswer(question, answer, grade);
            break;
        case "fillIn":
            questionElement = new FillIn(question, answer, grade);
        }

        return questionElement;
    }

    static generateEmpty(questionType: string): QuestionElement | undefined
    {
        const ID = Math.random();
        const title = "[naslov pitanja]";
        const required = documentMetadata.type === "exam";
        let points = 0;
        
        const questionData: IQuestionData = { ID: ID, title: title, required: required, points: points, type: questionType, ordinal: -1 };
        
        switch (questionType) {
            case "shortAnswer":
                break;
            case "singleChoice": case "multiChoice":
                questionData.offeredAnswers = ["1. odgovor", "2. odgovor"];
            case "longAnswer":
                break;
            case "fillIn":
                break;
        }

        return QuestionElement.generate(questionData, { ID: ID, value: null }, undefined);
    }
}

export class ShortAnswer extends QuestionElement
{
    private input: HTMLInputElement;


    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super(data, answer, grade);

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

    showSolution(): void
    {
        if (this.grade?.points === 0) {
            this.input.style.color = "red";
            const solutionDiv = document.createElement("div");
            this.inputsDiv.appendChild(solutionDiv);
            solutionDiv.innerHTML = "Točan odgovor: <span style='color: lime;'>" + this.solution.value;
        }
        else
            this.input.style.color = "lime";
    }
}

export class LongAnswer extends QuestionElement
{
    private input: HTMLTextAreaElement;


    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super(data, answer, grade);

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

    showSolution(): void
    {
        
    }
}

export class MultiChoice extends QuestionElement
{
    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super(data, answer, grade);

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

    showSolution(): void
    {   
        for (const checkbox of this.inputsDiv.getElementsByTagName("input")) {
            if (this.solution.value?.includes(checkbox.value))
                checkbox.parentElement?.classList.add("correct");
            else if (checkbox.checked)
                checkbox.parentElement?.classList.add("incorrect");
        }
    }
} 

export class FillIn extends QuestionElement
{
    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super(data, answer, grade);

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

    showSolution(): void
    {
        const inputs = this.inputsDiv.getElementsByTagName("input");

        const solutionDiv = document.createElement("div");

        for (let i = 0; i < this.solution.value!.length; ++i) {
            if (this.solution.value![i] === this.answer.value![i])
                inputs[i].style.color = "lime";
            else {
                inputs[i].style.color = "red";
                solutionDiv.innerHTML += `${i+1}: <span style='color: lime;'>${this.solution.value![i]}</span> `;
            }
        }

        if (solutionDiv.innerHTML) {
            solutionDiv.innerHTML = "Točni odgovori: " + solutionDiv.innerHTML;
            this.inputsDiv.appendChild(solutionDiv);
        }
    }
}

customElements.define("short-answer", ShortAnswer, { extends: "div" });
customElements.define("single-choice", MultiChoice, { extends: "div" });
customElements.define("long-answer", LongAnswer, { extends: "div" });
customElements.define("fill-in", FillIn, { extends: "div" });
