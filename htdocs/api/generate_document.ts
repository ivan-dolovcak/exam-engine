import { QuestionElement, IQuestionData, IAnswer } from "./question_element.js";

interface IDocument
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
    documentJSON?: string
}

let documentMetadata: IDocument;
let documentContent: IQuestionData[];
const documentID = new URL(location.toString()).searchParams.get("ID");
let answers: IAnswer[] = [];


export function saveAnswersLocal(): void
{
    localStorage.setItem(documentID + "answers", JSON.stringify(answers));
    console.log("Saved document answers locally.");
}

async function fetchDocument(): Promise<any>
{
    const response
        = await fetch(`/views/document.php?ID=${documentID}&loadDocument`);
    const json = await response.json();
    return json;
}

async function generateDocument()
{
    documentMetadata = await fetchDocument();
    documentContent = JSON.parse(documentMetadata.documentJSON!);
    delete documentMetadata.documentJSON;
    documentContent = documentContent.sort((q1, q2) => { return q1.ordinal - q2.ordinal });

    const localAnswers = localStorage.getItem(documentID + "answers");
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
