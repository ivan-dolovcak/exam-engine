/** Question object extracted from the document JSON. */
interface IQuestionData
{
    id: number,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    answers?: string[],
    size?: [number, number]
}

interface IDocumentMetadata
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
}

let documentMetadata: IDocumentMetadata;
let questions: IQuestionData[];
const documentID = new URL(location.toString()).searchParams.get("ID");

abstract class QuestionElement extends HTMLDivElement
{
    protected questionJSONData: IQuestionData;
    protected inputsDiv: HTMLDivElement


    set headerTitle(title: string)
    {
        const titleEl
            = this.getElementsByClassName("title")[0] as HTMLHeadingElement;
        titleEl.innerText = title;
        this.questionJSONData.title = title;
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
            input.addEventListener("blur", saveAnswers);
    }
}

class ShortAnswer extends QuestionElement
{
    private input: HTMLInputElement;


    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.setAttribute("autocomplete", "off");
        this.input.name = this.questionJSONData.id.toString();
        this.inputsDiv.appendChild(this.input);
    }
}

class LongAnswer extends QuestionElement
{
    private input: HTMLTextAreaElement;


    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        this.input = document.createElement("textarea");
        this.input.rows = this.questionJSONData.size![1];
        this.input.cols = this.questionJSONData.size![0];
        this.input.spellcheck = false;
        this.input.name = this.questionJSONData.id.toString();
        this.inputsDiv.appendChild(this.input);
    }
}

class MultiChoice extends QuestionElement
{
    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

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
}

class FillIn extends QuestionElement
{
    constructor(questionJSONData: IQuestionData)
    {
        super(questionJSONData);

        const partialText = document.createElement("p");
        partialText.innerText = this.questionJSONData.partialText!;
        partialText.innerHTML = partialText.innerHTML.replace(
            /\u200e/g, `<input name="${this.questionJSONData.id}?" type="text" autocomplete="off">`);
        
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

async function fetchDocumentMetadata(): Promise<any>
{
    // For passing the document from PHP to JS (loadDocumentContent in GET):
    const response = await fetch(
        `/views/document.php?ID=${documentID}&loadDocumentMetadata`);
    const json = await response.json();
    return json;
}

async function fetchDocumentContent(): Promise<any>
{
    // For passing the document from PHP to JS (loadDocumentContent in GET):
    const response = await fetch(
        `/views/document.php?ID=${documentID}&loadDocumentContent`);
    const json = await response.json();
    return JSON.parse(json);
}


async function generateDocument()
{
    documentMetadata = await fetchDocumentMetadata();
    questions = await fetchDocumentContent();
    questions = questions.sort((q1, q2) => { return q1.ordinal - q2.ordinal });

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

    loadAnswers();
}

type IAnswers = {
    [key: string]: string | string[]
};

function saveAnswers(): void
{
    const formData: FormData = new FormData(document.forms[0]);
    // Convert IterableIterator<[string, FormDataEntryValue]> to 2D string array:
    const x = [...formData.entries()].map(a => [a[0], a[1].toString()]);
    const formDataSerialized: string = new URLSearchParams(x).toString();

    // let formDataJSON: IAnswers = {};

    // for (let [key, value] of formData.entries())
    // {
    //     value = value.toString().trim();
    //     // Don't store unanswered questions, except for FillIn type to preserve
    //     // order of answers (their name ends with a ?):
    //     if (! value && ! key.endsWith("?"))
    //         continue;
    
    //     // Handle inputs with multiple values (e.g. checkboxes).
    //     if(!(key in formDataJSON)) {
    //         formDataJSON[key] = value;
    //         continue;
    //     }
    //     // If key already exists, convert it into an array.
    //     if(! Array.isArray(formDataJSON[key])){
    //         formDataJSON[key] = [formDataJSON[key]] as string[];
    //     }
    //     (formDataJSON[key] as string[]).push(value);
    // }
    
    localStorage.setItem(documentID + "answers", formDataSerialized);
    console.log("Saved document answers locally.");
}

function loadAnswers(): void
{
    const answersSerialized: string | null = localStorage.getItem(documentID + "answers");
    if (answersSerialized == null)
        return;
    
    const form: HTMLFormElement = document.forms[0];
    const answers: [string, string][]
        = Array.from((new URLSearchParams(answersSerialized)).entries());

    let nodeCounter = 0;
    for (const [name, val] of answers) {
        const input: Element | RadioNodeList | null = form.elements.namedItem(name);
        if (input instanceof RadioNodeList) {
            if (name.endsWith("?"))
                (input[nodeCounter++] as HTMLInputElement).value = val;
            else
                nodeCounter = 0;
            for (let x of input) {
                if ((x as HTMLInputElement).value == val)
                    (x as HTMLInputElement).checked = true;
            }
        }
        else
            (input as HTMLInputElement).value = val;
    }
}
