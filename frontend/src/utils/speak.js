let utterance = null;

export const speakText = (text, lang = "en-US", onEnd) => {
    stopSpeaking();

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
};
