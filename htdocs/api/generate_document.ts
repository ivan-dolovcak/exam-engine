import { QuestionElement, IQuestionData, IAnswer } from "./question_element.js";

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
let answers: IAnswer[] = [];


export function saveAnswersLocal(): void
{
    localStorage.setItem(documentID + "answers", JSON.stringify(answers));
    console.log("Saved document answers locally.");
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

    const localAnswers = localStorage.getItem(documentID + "answers");
    if (localAnswers !== null)
        answers = JSON.parse(localAnswers);

    const questionsBox
        = document.getElementById("questions-box") as HTMLFormElement | null;
    
    for (const question of questions) {
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

window.addEventListener("load", generateDocument);
document.getElementById("clear-answers")?.addEventListener("click", clearAnswers);
