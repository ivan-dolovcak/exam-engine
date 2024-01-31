import { QuestionElement, IQuestionData, IAnswerData } from "./question_element.js";

/** Document data object from DB. */
interface IDocumentData
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
    documentJSON?: string       // deleted after moving into documentContent
    ID: string,
    submissionID: string,
    generatingMode?: string
}

export interface ISubmissionData
{
    documentID: string,
    datetimeStart: string,
    datetimeEnd: string,
    submissionJSON: string
}

export let documentMetadata: IDocumentData;
let documentContent: IQuestionData[];
/** User submitted form data for the specific document questions. */
let answers: IAnswerData[] = [];
/** localStorage variable name for locally saved user form submission. */
let answersLSName: string;
let submission: ISubmissionData | null = null;

/** Fetch required document data from DB. */
async function fetchDocument(documentID: string): Promise<IDocumentData>
{
    const response = await fetch(
        `/views/document.php?documentID=${documentID}&loadDocument`);
    const json = await response.json();
    return json;
}

async function fetchSubmission(): Promise<ISubmissionData>
{
    const response = await fetch(`${location.href}&loadSubmission`);
    const json = await response.json();
    return json;
}

/** Dynamically generate all document elements. */
function generateDocument(): void
{
    // Apply the order of generated questions:
    documentContent = documentContent.sort(
        (q1, q2) => { return q1.ordinal - q2.ordinal });

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

    if (documentMetadata.generatingMode !== "answer")
        document.getElementById("questions-box-buttons")?.remove();
    else {
        document.getElementById(
            "clear-answers")?.addEventListener("click", clearAnswers);
        document.getElementById(
            "submit-answers")?.addEventListener("click", submitAnswers);
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
    console.log("cleared local answers");
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
    // Obfuscated document ID and generating mode are passed in GET:
    const GET: URLSearchParams = new URL(location.toString()).searchParams;

    let documentMetadataGET = {
        ID: GET.get("documentID"),
        submissionID: GET.get("submissionID"),
        generatingMode: GET.get("mode")!,
    }

    // In case of review mode, fetch submission content and metadata and the
    // document ID of the submission.
    if (documentMetadataGET.generatingMode === "review") {
        submission = await fetchSubmission();
        documentMetadataGET.ID = submission.documentID;
        
        answers = JSON.parse(submission.submissionJSON);
    }
    else {
        answersLSName = `${documentMetadataGET.ID}answers`;
        // Read previously saved answers if they exist:
        const localAnswers = localStorage.getItem(answersLSName);
        if (localAnswers !== null)
            answers = JSON.parse(localAnswers);
    }

    // Merge metadata from GET and from DB:
    documentMetadata = {
        ...documentMetadataGET,
        ...await fetchDocument(documentMetadataGET.ID!)
    };

    // Move the document content from the metadata into its separate object:
    documentContent = JSON.parse(documentMetadata.documentJSON!);
    delete documentMetadata.documentJSON;

    generateDocument();
}

window.addEventListener("load", init);
