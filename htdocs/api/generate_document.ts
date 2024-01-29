import { QuestionElement, IQuestionData, IAnswer } from "./question_element.js";

interface IDocument
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
    documentJSON?: string
    ID: string,
    generatingMode: string
}

let documentMetadata: IDocument;
let documentContent: IQuestionData[];
let answers: IAnswer[] = [];

const get: URLSearchParams = new URL(location.toString()).searchParams;
const documentID = get.get("documentID");
const generatingMode = get.get("mode");
const answersLSName = `${documentID}answers`;

export function saveAnswersLocal(): void
{
    localStorage.setItem(answersLSName, JSON.stringify(answers));
    console.log("Saved document answers locally.");
}

async function fetchDocument(): Promise<IDocument>
{
    const response
        = await fetch(`/views/document.php?documentID=${documentID}&loadDocument`);
    const json = await response.json();
    return json;
}

async function generateDocument(): Promise<void>
{
    documentMetadata = await fetchDocument();
    if (documentMetadata === null) {
        location.href = "/views/home.phtml";
        return;
    }

    documentMetadata.ID = get.get("documentID")!;
    documentMetadata.generatingMode = get.get("mode")!;

    documentContent = JSON.parse(documentMetadata.documentJSON!);
    delete documentMetadata.documentJSON;
    documentContent = documentContent.sort((q1, q2) => { return q1.ordinal - q2.ordinal });

    const localAnswers = localStorage.getItem(answersLSName);
    if (localAnswers !== null)
        answers = JSON.parse(localAnswers);

    const questionsBox
        = document.getElementById("questions-box") as HTMLFormElement | null;
    
    for (const question of documentContent) {
        let answer: IAnswer | undefined = answers.find(x => x.id === question.id);

        let questionElement: QuestionElement | undefined;
        if (answer === undefined) {
            answers.push({ id: question.id, value: null });
            questionElement = QuestionElement.generate(question, answers[answers.length-1])
        }
        else
            questionElement = QuestionElement.generate(question, answer)

        questionsBox?.appendChild(questionElement!);
    }
}

function clearAnswers(): void
{
    localStorage.removeItem(`${documentID}answers`);
    location.reload();
}

async function submitAnswers(): Promise<void>
{
    await fetch(`/api/submit_document.php?ID=${documentID}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: localStorage.getItem(`${documentID}answers`)
    })
    .then(response => {
        if (!response.ok)
            throw new Error('Network error.');
        else {
            clearAnswers();
            location.href = "/views/home.phtml";
        }
    });
}

window.addEventListener("load", generateDocument);
document.getElementById("clear-answers")?.addEventListener("click", clearAnswers);
document.getElementById("submit-answers")?.addEventListener("click", submitAnswers);
