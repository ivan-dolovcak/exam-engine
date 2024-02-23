import { QuestionElement, IQuestionData, IAnswerData } from "./question_element.js";

/** Document data object from DB. */
interface IDocumentData
{
    name: string,
    type: string,
    passwordHash: string,
    deadlineDatetime: string,
    documentJSON?: string,       // deleted after moving into documentContent
    solutionJSON?: string,      // TODO: security!
    ID: number,
    submissionID: string,
    generatingMode?: string,
}

export interface ISubmissionData
{
    documentID: string,
    datetimeStart: string,
    datetimeEnd: string,
    submissionJSON: string,
    gradingJSON: string,
}

export interface IGradingData
{
    ID: number,
    points: number | null,
}

export let documentMetadata: IDocumentData;
let documentContent: IQuestionData[];
/** User submitted form data for the specific document questions. */
let answers: IAnswerData[] = [];
let grades: IGradingData[];
/** localStorage variable name for locally saved user form submission. */
let answersLSName: string;
export let contentLSName: string;
// New questions created in editing mode:
export let documentContentNew: IQuestionData[];
let submission: ISubmissionData | null = null;
export let solutions: IAnswerData[] | null = null;

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

export function generateNewQuestionBtn(newQuestionOrdinal: number = 0): HTMLDivElement
{
    // Clone the dropdown template
    const template = document.getElementById("new-question-btn-template") as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as HTMLDivElement;

    // Add event listeners to the options
    for (const option of clone.querySelectorAll(".dropdown-option")) {
        option.addEventListener("click", () => {
            const questionElement = QuestionElement.generateEmpty(option.innerHTML);
            option.parentElement!.parentElement!.replaceWith(questionElement!);
            saveQuestion(questionElement!.data);
        });
    }
    
    return clone;
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
            answer => answer.ID === questionData.ID);
        
        let gradeData: IGradingData | undefined;
        if (submission !== null)
            gradeData = grades.find(grade => grade.ID === questionData.ID);
        
        let questionElement: QuestionElement | undefined;
        // If user hasn't submitted an answer, create an empty one:
        if (answerData === undefined) {
            answers.push({ ID: questionData.ID, value: null });
            questionElement = QuestionElement.generate(
                questionData, answers[answers.length - 1], gradeData);
        }
        else
            questionElement = QuestionElement.generate(
                questionData, answerData, gradeData);

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
    // Save only non-nullish values:
    const cleanAnswers: IAnswerData[]
        = answers.filter(answer => {
            if (Array.isArray(answer))
                return ! answer.every(value => value === null);
            return answer.value !== null
        });

    localStorage.setItem(answersLSName, JSON.stringify(cleanAnswers));
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
    await fetch(
        `/api/submission_process.php?documentID=${documentMetadata.ID}&documentType=${documentMetadata.type}`,
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

export function saveQuestion(question: IQuestionData)
{
    // Load
    const localQuestionsJSON: string | null
        = localStorage.getItem(contentLSName);
    
    const localQuestions: IQuestionData[] = JSON.parse(localQuestionsJSON ?? "[]");   

    // Modify
    let oldQuestionIndex: number
        = localQuestions.findIndex(q => q.ID === question.ID);
    
    if (oldQuestionIndex === -1)
        localQuestions.push(question);
    else
        localQuestions[oldQuestionIndex] = question;        
    
    // Save
    localStorage.setItem(contentLSName, JSON.stringify(localQuestions));
    console.log("Saved modified question locally.")
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
        grades = JSON.parse(submission.gradingJSON);
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

    if (documentMetadataGET.generatingMode === "edit") {
        contentLSName = `${documentMetadataGET.ID}content`;
        // Load modified document content (in edit mode)
        const newDocumentContent: IQuestionData[]
            = JSON.parse(localStorage.getItem(contentLSName) ?? "[]");

        for (const newQuestion of newDocumentContent) {
            let oldQuestionIndex = documentContent.findIndex(q => q.ID === newQuestion.ID);
            if (oldQuestionIndex !== -1) {
                documentContent[oldQuestionIndex] = newQuestion;
            }
            else
                documentContent.push(newQuestion);
        }

        answers = JSON.parse(documentMetadata.solutionJSON!);
    }

    if (documentMetadata.solutionJSON)
        solutions = JSON.parse(documentMetadata.solutionJSON);

    generateDocument();
}

window.addEventListener("load", init);
document.addEventListener("contextmenu", (e) => { e.preventDefault(); });
