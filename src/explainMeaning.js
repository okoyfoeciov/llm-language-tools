import { show } from "./utils";

if (window.localStorage.getItem("explainMeaningRegistry") === null) {
    window.localStorage.setItem("explainMeaningRegistry", window.getSelection().toString())
    setTimeout(() => {
        window.localStorage.removeItem("explainMeaningRegistry")
    }, 300000);
} else {
    await show(`Explain the meaning of the word/phrase \`${window.localStorage.getItem("explainMeaningRegistry")}\` in this context (default to linguistic meaning, but if you think it is a jargon or proper noun, explain the meaning of that jargon or proper name too): ${window.getSelection().toString()}`, "explainMeaning", 1000)
    window.localStorage.removeItem("explainMeaningRegistry")
}
