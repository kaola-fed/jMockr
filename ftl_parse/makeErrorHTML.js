module.exports = function(tpl, error = "") {
    let errors = error.toString ? error.toString()
        .split(/\r\n|\n/)
        .map((e) => {
            return `<section>${e}</section>`;
        })
        .join('') : errors;
    return  `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>渲染出错</title>
        </head>
        <body style="padding: 100px; background-color: #000;">
            <h1 style="color: #C2F8F8;">渲染出错:${tpl}</h1>
            <article style="margin: 20px 0px; background-color: #C0FAC0; padding: 10px 20px; line-height: 30px; font-size: 20px;">
                ${errors}
            </article>
            <h1 style="color: #000;">Well, you screwed all this up again, congratulations.</h1>
        </body>
    </html>
    `;
};
