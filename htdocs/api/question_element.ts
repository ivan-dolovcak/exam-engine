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
    deleted?: boolean;
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

        this.updateTotalPoints();

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

            // Add total points
            this.getElementsByClassName("correct-points")[0]
                .innerHTML = (this.grade?.points?.toString() ?? "?");
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
            // Add deleting questions
            this.titleEl.addEventListener("contextmenu", () => {
                this.data.deleted = true;
                saveQuestion(this.data);

                if (! (this.previousElementSibling instanceof QuestionElement))
                    this.previousElementSibling?.remove();

                this.remove();
            });
        }
    }

    updateTotalPoints(): void
    {
        this.getElementsByClassName("total-points")[0]
            .innerHTML = this.data.points.toString();
    }

    connectedCallback()
    {
        // Calculate ordinal
        if (this.data.ordinal === -1) {
            const nextSib: Element | null = this.nextElementSibling;
            const prevSib: Element | null = this.previousElementSibling;
            
            if (! prevSib && ! nextSib)
                this.data.ordinal = 10;
            else if (! prevSib) // Top (has to be positive)
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
        if (documentMetadata.generatingMode !== "review"
            && this.data.type !== "fillIn")
            for (const input of inputs)
                input.addEventListener("blur", () => {
                    this.saveAnswer();
                    if (! this.data.deleted)
                        saveAnswersLocal();
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
            this.parentElement!.appendChild(generateNewQuestionBtn());
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
        const ID: number = Math.floor(Math.random() * 10e9);
        const title = "[naslov pitanja]";
        const required = documentMetadata.type === "exam";
        let points = 1;
        
        const questionData: IQuestionData = { ID: ID, title: title, required: required, points: points, type: questionType, ordinal: -1 };
        
        switch (questionType) {
            case "shortAnswer":
                break;
            case "singleChoice": case "multiChoice":
                questionData.offeredAnswers = ["1. odgovor", "2. odgovor"];
                break;
            case "trueFalse":
                questionData.offeredAnswers = ["točno", "netočno"];
                break;
            case "longAnswer":
                break;
            case "fillIn":
                questionData.partialText = "pitanje \u200e";
        }

        return QuestionElement.generate(questionData, { ID: ID, value: ["odgovor"] }, undefined);
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
    private lastEditedOfferedAnswer: string | undefined;
    
    constructor(data: IQuestionData, answer: IAnswerData, grade: IGradingData | undefined)
    {
        super(data, answer, grade);

        let offeredAnswers;
        if (this.data.type === "trueFalse")
            offeredAnswers = ["točno", "netočno"];
        else
            offeredAnswers = this.data.offeredAnswers!;

        for (const offeredAnswer of offeredAnswers) {
            this.createInput(offeredAnswer);
        }

        if (documentMetadata.generatingMode === "edit"
                && this.data.type !== "trueFalse")
        this.appendChild(this.createNewOfferedAnswerBtn());
    }

    editOfferedAnswer(e: MouseEvent, self: HTMLSpanElement)
    {
        this.lastEditedOfferedAnswer = self.innerText;
        self.contentEditable = "true";
        self.focus();
        e.preventDefault();
    }

    saveOfferedAnswer(self: HTMLSpanElement)
    {
        const newOfferedAnswer: string = self.innerText;
        this.data.offeredAnswers![this.data.offeredAnswers!.indexOf(
            this.lastEditedOfferedAnswer!)] = newOfferedAnswer;
        
        saveQuestion(this.data);
    }

    deleteOfferedAnswer(self: HTMLSpanElement)
    {
        this.data.offeredAnswers!.splice(this.data.offeredAnswers!.indexOf(self.innerText), 1);
        self.parentElement?.remove();
        saveQuestion(this.data);
    }

    createNewOfferedAnswerBtn(): HTMLDivElement
    {
        const newOfferedAnswerBtn = document.createElement("div");
        newOfferedAnswerBtn.innerText = "+";
        newOfferedAnswerBtn.className = "button";
        newOfferedAnswerBtn.addEventListener("click", () => {
            newOfferedAnswerBtn.remove();
            const newOfferedAnswer: string = (this.inputsDiv.children.length + 1) + ". odgovor";
            this.createInput(newOfferedAnswer);
            this.data.offeredAnswers?.push(newOfferedAnswer);
            saveQuestion(this.data);
            this.appendChild(this.createNewOfferedAnswerBtn());
        });
        return newOfferedAnswerBtn;
    }

    createInput(offeredAnswer: string)
    {
        // Custom checkbox/radiobutton generation.
        const radioContainer = document.createElement("label");
        radioContainer.classList.add("multi-container");
        const offeredAnswerSpan = document.createElement("span");
        offeredAnswerSpan.innerText = offeredAnswer;
        radioContainer.appendChild(offeredAnswerSpan);
        radioContainer.htmlFor = this.data.ID.toString() + Math.random();
        this.inputsDiv.appendChild(radioContainer);

        // Enable editing
        if (documentMetadata.generatingMode === "edit"
            && this.data.type !== "trueFalse") {
            offeredAnswerSpan.style.cursor = "text";

            const deleteBtn = document.createElement("span");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "X";
            
            deleteBtn.addEventListener(
                "click", () => this.deleteOfferedAnswer(offeredAnswerSpan));
            radioContainer.appendChild(deleteBtn);

            offeredAnswerSpan.addEventListener(
                "click", (e) => this.editOfferedAnswer(e, offeredAnswerSpan));
            offeredAnswerSpan.addEventListener(
                "blur", () => this.saveOfferedAnswer(offeredAnswerSpan));
        }

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

    saveAnswer(): void
    {
        this.answer.value = [];
        this.data.points = 0;
        for (const radioBtn of this.inputsDiv.getElementsByTagName("input"))
            if (radioBtn.checked) {
                this.answer.value.push(radioBtn.value);
                this.data.points++;
            }
        
        this.updateTotalPoints();
        
        if (this.data.type !== "multiChoice")
            this.answer.value = this.answer.value[0] ?? null;
        if (Array.isArray(this.answer.value) && this.answer.value.length === 0)
            this.answer.value = null;
    }

    loadAnswer(): void {
        let answer = this.answer.value;
        if (!Array.isArray(answer))
            answer = [answer!];
        for (const radioBtn of this.inputsDiv.getElementsByTagName("input")) {
            if (answer.includes(radioBtn.value)) {
                radioBtn.checked = true;
            }
        }
    }

    showSolution(): void
    {
        for (const checkbox of this.inputsDiv.getElementsByTagName("input")) {
            if (this.solution.value?.includes(checkbox.value)
                )
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

        this.inputsDiv.contentEditable = "true";
        this.inputsDiv.addEventListener("keypress", (ev) => {
            if (ev.key === "Enter")
                ev.preventDefault();
        });
        this.inputsDiv.addEventListener("contextmenu", (ev) => {
            if (! this.inputsDiv.isSameNode(ev.target as Node))
                return;
            let selection = window.getSelection();
            let range = selection?.getRangeAt(0);
            range?.deleteContents();
            range?.insertNode(this.createInput());
            this.updatePartialText();
        });
        this.inputsDiv.addEventListener("blur", () => { this.updatePartialText() });

        const textFragments: string[]
            = this.data.partialText!.split("\u200e");
        
        for (const textFragment of textFragments) {
            this.inputsDiv.insertAdjacentText("beforeend", textFragment);

            const input = this.createInput();
            
            this.inputsDiv.appendChild(input);
        }

        this.inputsDiv.lastChild?.remove();
    }

    createInput(): HTMLInputElement
    {
        const input = document.createElement("input");
        input.type = "text";
        input.name = this.data.ID.toString();
        input.spellcheck = false;
        input.autocomplete = "off";
        input.insertAdjacentText("beforebegin", " ");
        input.insertAdjacentText("afterend", " ");
        input.addEventListener("blur", () => { this.saveAnswer(); saveAnswersLocal(); });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.innerHTML = "-";
        delBtn.style.display = "none";
        this.inputsDiv.appendChild(delBtn);
        input.addEventListener("contextmenu", (ev) => {
            delBtn.style.display = "block";
            delBtn.style.position = "absolute";
            delBtn.style.left = ev.clientX + "px";
            delBtn.style.top = (ev.clientY + window.scrollY) + "px";
        });
        delBtn.addEventListener("click", () => {
            input.remove();
            delBtn.remove();
            this.updatePartialText();
        });
        input.addEventListener("blur", () => {
            setTimeout(() => {
                delBtn.style.display = "none"; 
            }, 200);
        });
        return input;
    }

    updatePartialText(): void
    {
        let newPartialText: string = "";
        this.data.points = 0;
        for (const node of this.inputsDiv.childNodes) {
            if (node instanceof Text)
                newPartialText += node.data;
            else if (node instanceof HTMLInputElement) {
                newPartialText += "\u200e";
                this.data.points++;
            }
                
        }
            
        this.saveAnswer();
        saveAnswersLocal();
        this.data.partialText = newPartialText.trim();
        this.updateTotalPoints();
        saveQuestion(this.data);
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
            if (this.answer.value
                && this.solution.value![i] === this.answer.value![i])
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
