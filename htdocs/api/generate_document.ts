/** Question object extracted from the document JSON. */
interface IQuestionData
{
    id: number,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    answers?: string[],
    size?: [number, number?]
}

let questions: IQuestionData[];

abstract class QuestionElement extends HTMLDivElement
{
    questionJSONData: IQuestionData;
    inputsDiv: HTMLDivElement
    abstract readonly answer: string | string[] | number | null;


    set headerTitle(title: string)
    {
        const titleEl
            = this.getElementsByClassName("title")[0] as HTMLHeadingElement;
        titleEl.innerText = title;
        this.questionJSONData.title = title;
    }
    
    set ordinal(ordinal: number)
    {
        const ordinalEl
            = this.getElementsByClassName("ordinal")[0] as HTMLSpanElement;
        ordinalEl.innerText = ordinal.toString();
        this.style.order = ordinal.toString();
        this.questionJSONData.ordinal = ordinal;
    }

    constructor(questionJSONData: IQuestionData)
    {
        super();
        this.questionJSONData = questionJSONData;
   
        // Create question box from HTML template:
        const questionTemplate = document.getElementById(
            "question-template") as HTMLTemplateElement;
        const questionHTML: DocumentFragment = questionTemplate.content;
        this.appendChild(questionHTML.cloneNode(true));

        this.inputsDiv
            = this.getElementsByClassName("inputs")[0] as HTMLDivElement;

        this.headerTitle = this.questionJSONData.title;
        this.ordinal = this.questionJSONData.ordinal;
    }
}

class ShortAnswer extends QuestionElement
{
    input: HTMLInputElement;

    get answer()
    {
        const answer = this.input.value.trim()
        return answer ? answer : null;
    }

    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        this.input = document.createElement("input");
        this.inputsDiv.appendChild(this.input);
    }
}

class LongAnswer extends QuestionElement
{
    input: HTMLTextAreaElement;

    get answer()
    {
        const answer = this.input.value.trim()
        return answer ? answer : null;
    }

    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        this.input = document.createElement("textarea");
        this.input.rows = this.questionJSONData.size![0];
        this.input.cols = this.questionJSONData.size![1]!;
        this.inputsDiv.appendChild(this.input);
    }
}

class MultiChoice extends QuestionElement
{
    get answer()
    {
        let answers: string[] = [];

        const radioBtns
            = this.inputsDiv.children as HTMLCollectionOf<HTMLInputElement>;
        for (const radioBtn of radioBtns) {
            if (radioBtn.checked)
                answers.push(radioBtn.value);
        }

        if (answers.length === 0)
            return null;

        if (this.questionJSONData.type === "multiChoice")
            return answers;
        else
            return answers[0];
    }

    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        let offeredAnswers;
        if (this.questionJSONData.type === "trueFalse")
            offeredAnswers = ["točno", "netočno"];
        else
            offeredAnswers = this.questionJSONData.answers!;

        for (const offeredAnswer of offeredAnswers) {
            const radioBtn = document.createElement("input");
            radioBtn.type = this.questionJSONData.type === "multiChoice" ? "checkbox" : "radio";
            radioBtn.name = this.questionJSONData.id.toString();
            radioBtn.id = this.questionJSONData.id.toString() + Math.floor(Math.random() * 1000);
            radioBtn.value = offeredAnswer;
            this.inputsDiv.appendChild(radioBtn);

            const radioLabel = document.createElement("label");
            radioLabel.innerText = offeredAnswer;
            radioLabel.htmlFor = radioBtn.id;
            this.inputsDiv.appendChild(radioLabel);
        }
    }
}

class FillIn extends QuestionElement
{
    get answer()
    {
        let answers: string[] = [];
        for (const input of this.inputsDiv.getElementsByTagName("input")) {
            answers.push(input.value.trim());
        }

        if (answers.length === 0)
            return null;
        else
            return answers;
    }

    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        const partialText = document.createElement("p");
        partialText.innerText = this.questionJSONData.partialText!;
        partialText.innerHTML
            = partialText.innerHTML.replace(/\u200e/g, "<input>");
        
        this.inputsDiv.appendChild(partialText);
    }

}

function generateQuestionElement(question: IQuestionData)
    : QuestionElement | undefined
{
    let questionElement: QuestionElement | undefined;

    switch (question.type) {
    case "shortAnswer":
        questionElement = new ShortAnswer(question);
        break;
    case "singleChoice": case "multiChoice": case "trueFalse":
        questionElement = new MultiChoice(question);
        break;
    case "longAnswer":
        questionElement = new LongAnswer(question);
        break;
    case "fillIn":
        questionElement = new FillIn(question);
    }
    
    return questionElement;
}

async function fetchDocumentJSON() : Promise<any>
{
    // for passing the document from PHP to JS (loadDocumentContent in GET):
    const response = await fetch(`${window.location.href}&loadDocumentContent`);
    const json = await response.json();
    return JSON.parse(json);
}

async function generateDocument(): Promise<any>
{
    questions = await fetchDocumentJSON();

    customElements.define("short-answer", ShortAnswer, { extends: "div" });
    customElements.define("single-choice", MultiChoice, { extends: "div" });
    customElements.define("long-answer", LongAnswer, { extends: "div" });
    customElements.define("fill-in", FillIn, { extends: "div" });

    const questionsBox
        = document.getElementById("questions-box") as HTMLFormElement | null;
    
    for (const question of questions) {
        const questionElement: QuestionElement | undefined
            = generateQuestionElement(question);    
        if (questionElement === undefined)
            continue;

        questionsBox?.appendChild(questionElement);
    }    
}
