;(function () {

function getReactions(repo, id) {
    return Promise.resolve(null)
}

const getMarkdownConverter = (function () {
    const converter = new showdown.Converter({
        simplifiedAutoLink: true,
        excludeTrailingPunctuationsFromURLs: true,
        tables: true,
        strikethrough: true,
        ghMentions: true,
        ghMentionsLink: true,
        ghCodeBlocks: true,
        openLinksInNewWindow: true,
        taskLists: true,
    })
    return function (markdown) {
        return converter.makeHtml(markdown)
    }
})

function getComments(repo, id) {
    const url = `https://api.github.com/repos/${repo}/issues/${id}/comments`
    return fetch(url)
        .then(response => response.json())
        .then(comments => comments.map(comment => ({
            body_html: markdownToHTML(comment.body),
            user: { login: comment.user.login, avatar_url: comment.user.avatar_url },
        })))
}

function getCommentElementFrom(comment) {
    return `
    <article class="page-comment">
        <div class="page-comment-author">
            <img src="${comment.user.avatar_url}" alt="Avatar of ${comment.user.login}">
            <p>${comment.user.login}</p>
        </div>
        <div class="page-comment-content">${comment.body_html}</div>
    </article>
    `
}

async function main(repo, id) {
    markdownToHTML = getMarkdownConverter()
    let rcomments = getComments(repo, id)
    let [comments] = [await rcomments]

    const pageComments = document.querySelector('#page-comments')
    for (comment of comments) {
        pageComments.innerHTML += getCommentElementFrom(comment)
    }
}

window.loadGithubCommentsFrom = function (repo, id, showdown) {
    const script = document.createElement('script')
    script.src = showdown
    script.onload = () => {
        main(repo, id)
    }
    document.body.appendChild(script)
}

})()
