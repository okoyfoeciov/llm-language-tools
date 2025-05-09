import { show } from "./utils";

if (window.getSelection().toString()) {
    if (window.localStorage.getItem("explainMeaningRegistry") === null) {
        window.localStorage.setItem("explainMeaningRegistry", window.getSelection().toString())
    } else {
        await show(`Explain the meaning of the word/phrase \`${window.localStorage.getItem("explainMeaningRegistry")}\` in this context (notice that beyond liguistic meaning, the word/phrase could be a jargon or proper name; provide the response concise as possible): ${window.getSelection().toString()}`, "explainMeaning", 1000)
        window.localStorage.removeItem("explainMeaningRegistry")
    }
} else {
    window.localStorage.removeItem("explainMeaningRegistry")
}
