import { QuestionElement, IQuestionData, IAnswerData } from "./question_element.js";

/** Document data object from DB. */
interface IDocumentData
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
    documentJSON?: string
    ID: string,
    generatingMode: string
}

export let documentMetadata: IDocumentData;
let documentContent: IQuestionData[];
let answers: IAnswerData[] = [];
let answersLSName: string; // localStorage variable name

/** Fetch required document data from DB. */
async function fetchDocument(): Promise<IDocumentData>
{
    const response = await fetch(`${location.href}&loadDocument`);
    const json = await response.json();
    return json;
}

/** Dynamically generate all document elements. */
function generateDocument(): void
{
    // Apply the order of generated questions:
    documentContent = documentContent.sort(
        (q1, q2) => { return q1.ordinal - q2.ordinal });

    // Read previously saved answers if they exist:
    const localAnswers = localStorage.getItem(answersLSName);
    if (localAnswers !== null)
        answers = JSON.parse(localAnswers);

    // Dynamic content generation.
    const questionsBox
        = document.getElementById("questions-box") as HTMLFormElement | null;
    
    for (const questionData of documentContent) {
        // Find the user's corresponding answer to the current question:
        let answerData: IAnswerData | undefined = answers.find(
            answer => answer.id === questionData.id);

        let questionElement: QuestionElement | undefined;
        // If user hasn't submitted an answer, create an empty one:
        if (answerData === undefined) {
            answers.push({ id: questionData.id, value: null });
            questionElement = QuestionElement.generate(
                questionData, answers[answers.length - 1]);
        }
        else
            questionElement = QuestionElement.generate(
                questionData, answerData);

        questionsBox?.appendChild(questionElement!);
    }
}

/** Save user submission locally at all times. */
export function saveAnswersLocal(): void
{
    localStorage.setItem(answersLSName, JSON.stringify(answers));
    console.log("Saved document answers locally.");
}

function clearAnswers(): void
{
    localStorage.removeItem(answersLSName);
    location.reload();
}

/** Store user submission in DB. */
async function submitAnswers(): Promise<void>
{
    await fetch(`/api/submit_document.php?ID=${documentMetadata.ID}`,
    {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: localStorage.getItem(answersLSName)
    })
    .then(response => {
        if (!response.ok)
            throw new Error('Network error.');
        else {
            clearAnswers(); // Delete the locally saved answers.
            location.href = "/views/home.phtml";
        }
    });
}

async function init(): Promise<void>
{
    documentMetadata = await fetchDocument();
    if (documentMetadata === null) {
        // Redirect in case of invalid ID:
        location.href = "/views/home.phtml";
        return;
    }

    const GET: URLSearchParams = new URL(location.toString()).searchParams;

    documentMetadata.ID = GET.get("documentID")!;
    documentMetadata.generatingMode = GET.get("mode")!;
    answersLSName = `${documentMetadata.ID}answers`;

    // Move the document content from the metadata into its separate object:
    documentContent = JSON.parse(documentMetadata.documentJSON!);
    delete documentMetadata.documentJSON;

    if (documentMetadata.generatingMode !== "answer")
        document.getElementById("questions-box-buttons")?.remove();

    document.getElementById(
        "clear-answers")?.addEventListener("click", clearAnswers);
    document.getElementById(
        "submit-answers")?.addEventListener("click", submitAnswers);

    generateDocument();
}

window.addEventListener("load", init);
