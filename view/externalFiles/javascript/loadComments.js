///////////////////////////////////////////////////////////////////////////////////////////////////
//Meeseeks
//iPhone Post
//loadComments.js
//When viewing a post, ppl can comment by either asking a question or providing a possible answser.
//this script controls which comments you are currently viewing
///////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = init;

var postColumn;
var btnQuestions, btnSolutions, btnCompany;
var textArea;

function init() {
    btnQuestions = document.querySelector('#btnQuestions');
    btnSolutions = document.querySelector('#btnSolutions');
    btnCompany = document.querySelector('#btnCompany');

    btnQuestions.addEventListener('click', loadQuestions);
    btnSolutions.addEventListener('click', loadSolutions);
    btnCompany.addEventListener('click', loadCompany);

    postColumn = document.querySelector('#postColumn');
    textArea = document.querySelector('textArea');

    loadQuestions();
}

function loadQuestions() {
    postColumn.innerHTML = '';

    btnQuestions.className = ('btn btn-primary');
    btnSolutions.className = ('btn btn-secondary');
    btnCompany.className = ('btn btn-secondary');

    textArea.placeholder = 'Ask a question about the post...'

    var questions = ['Is your charger made by Apple or a third party?', 'Does you charger have any damage to it, especially near the lightning jack?', 'Does this still happen when you use a different charger?', '<blockquote class="blockquote">…rest the charger on a surface</blockquote>What do you mean by this exactly?']

    questions.forEach(function(question) {
        var li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = '<small>3 months ago</small><small class="font-weight-bold text-secondary">@sleepygary</small><p>' + question + '</p><p>&#9650; -1 &#9660;</p>';
        postColumn.appendChild(li);
    })
}

function loadSolutions() {
    postColumn.innerHTML = '';

    btnQuestions.className = ('btn btn-secondary');
    btnSolutions.className = ('btn btn-primary');
    btnCompany.className = ('btn btn-secondary');

    textArea.placeholder = 'Post a possible solution...'

    var solutions = ['Check for dust inside the lightning port.', 'Restart your phone.'];

    solutions.forEach(function(solution) {
        var li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = '<small>3 months ago</small><small class="font-weight-bold text-secondary">@sleepygary</small><p>' + solution + '</p><p>&#9650; -1 &#9660;</p>';
        postColumn.appendChild(li);
    })
}

function loadCompany() {
    postColumn.innerHTML = '';

    btnQuestions.className = ('btn btn-secondary');
    btnSolutions.className = ('btn btn-secondary');
    btnCompany.className = ('btn btn-primary');

    textArea.placeholder = "I guarantee you're not from Apple ;("
}