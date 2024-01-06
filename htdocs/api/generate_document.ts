interface QuestionData
{
    id: number,
    ordinal: number,
    title: string,
    type: string,
    partialText?: string,
    answers?: string[],
    width?: number,
    height?: number,
}

function generateQuestion(question: QuestionData) : HTMLDivElement
{
    const questionBox: HTMLDivElement = document.createElement("div");
    questionBox.style.order = question.ordinal.toString();

    const title: HTMLHeadingElement = document.createElement("h4");
    title.innerHTML = `<span>${question.ordinal}.</span> ${question.title}`;
    questionBox.appendChild(title);

    const answerArea: HTMLDivElement = document.createElement("div");
    questionBox.appendChild(answerArea);

    switch (question.type) {
    case "fillIn":
        const partialText: HTMLParagraphElement = document.createElement("p");
        question.partialText
            = question.partialText?.replace(/\u200E/g, (match: string) => {
                return `<input name=${question.id}[]>`;
            })
        
        partialText.innerHTML = question.partialText ?? "";
        answerArea.appendChild(partialText);
        break;
    case "shortAnswer":
        const textBox: HTMLInputElement = document.createElement("input");
        textBox.name = question.id.toString();
        textBox.size = question.width ?? 10;
            
        answerArea.appendChild(textBox);
        break;
    case "longAnswer":
        const textArea: HTMLTextAreaElement = document.createElement("textarea");
        textArea.name = question.id.toString();    
        textArea.rows = question.width ?? 10;
        textArea.cols = question.height ?? 80;

        answerArea.appendChild(textArea);
        break;
    case "trueFalse":
        // trueFalse is just a case of singleChoice    
        question.answers = ["točno", "netočno"];
    // singleChoice and multiChoice are identical except singleChoice uses
    // radiobuttons, whereas multiChoice uses checkboxes.
    case "singleChoice":
    case "multiChoice":
        question.answers?.forEach(answer => {
            const radio: HTMLInputElement = document.createElement("input");
            radio.type = question.type === "multiChoice" ? "checkbox" : "radio";
            radio.name = question.id.toString() + "[]";
            radio.id = question.id.toString() + Math.floor(Math.random() * 10000);
            radio.value = answer;
            answerArea.appendChild(radio);

            const label: HTMLLabelElement = document.createElement("label");
            label.htmlFor = radio.id;
            label.innerText = answer;
            answerArea.appendChild(label)
        });
    }

    return questionBox;
}

function generateDocument(json: string) : void
{
    const questions: QuestionData[] = JSON.parse(json);

    const questionsBox
        = document.getElementById("questions-box") as HTMLFormElement | null;

    questions.forEach(question => {
        questionsBox?.appendChild(generateQuestion(question));
    });
}
