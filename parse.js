function removeTagByTagName(tagName) {
    var ele = document.getElementsByTagName(tagName);
    return ele[0].parentNode.removeChild(ele[0]);
} // from https://stackoverflow.com/questions/43072644/how-can-i-remove-a-footer-element-using-javascript
function extractText() {
    removeTagByTagName("footer");
    return document.body.innerText;
}
