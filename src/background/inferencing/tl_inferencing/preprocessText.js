// The functions here turn (Readability Text) => (Input Words for Model).

import nltk_stopwords from './data_stopwords_NLTK.json'


function rm_control(s) {
    const reg_rm_control = /[\n\r\t]/g;
    s = s.replace(reg_rm_control, ' ');
    s = s.replace(/\x95/g, ' ');
    s = s.replace(/\x97/g, ' ');
    return s
}

function rm_punctuation(s) {
    s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    s = s.toLowerCase();
    return s
}

function rm_digits(s) {
    s = s.replace(/[0-9]/g, ' ');
    return s
}

function split_words(s) {
    return s.match(/\b(\w+)\b/g)
}

function rm_stopwords(s_words) {
    if (s_words == null) {
        console.log("s_words is empty")
        return ''
    }
    let final_words = [];
    // console.log(s_words)
    for (let word of s_words) {   // ES6 for-of statement
        if (nltk_stopwords.includes(word)) {
            continue;
        }
        else {
            final_words.push(word);
        }
    }
    return final_words
}

function clean_text(s) {
    let s1 = rm_control(s);
    let s2 = rm_punctuation(s1);
    let s3 = rm_digits(s2);
    let words = split_words(s3);
    let final_words = rm_stopwords(words);
    return final_words
}

export { clean_text };