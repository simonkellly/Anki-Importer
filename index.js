const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

// Options
const program = new Command();

program.requiredOption('-d, --dir <type>', 'directory to generate notes from');
program.option('-r, --recursive', 'generate notes from subdirectories', false)
program.option('-a, --anki <type>', 'flag at top of file to allow importation', '[Anki]');

program.parse(process.argv);

const options = program.opts();
const dir = options.dir;
const searchRecursively = options.recursive;
const flag = options.anki;

// Parsing
function parseDirectory(directory, recursive) {
    var files = [];
    fs.readdirSync(directory).forEach(file => {
        const fullPath = directory + '/' + file;
        var stat = fs.statSync(fullPath);
        if (recursive && stat && stat.isDirectory()) { 
            files = files.concat(parseDirectory(fullPath, recursive))
        } else if (path.extname(file) == ".md") {
            files.push(fullPath);
        }
    })
    return files;
}

function parseText(data){
    const lines = data.split(/\r?\n/);

    var flagged = false;
    var broken = false;
    var cards = [];
    var title = '';
    var section = '';
    var question = '';
    var card = {}

    function resetCurrentCard(){
        if (Object.keys(card).length != 0 && card.answer.length != 0){
            cards.push(card);
        }

        card = {
            id: '',
            title: '',
            section: '',
            question: '',
            answer: []
        }
    }

    resetCurrentCard()

    lines.forEach((line) => {
        var hasFlag = line.includes(flag);
        var text = line.trim().replace(flag, '');

        if (hasFlag){
            if (!flagged) flagged = true;
            else broken = true;
        }

        if (!flagged || broken) return;

        if (text.startsWith('---')){
            resetCurrentCard()
            return;
        }

        if (text.startsWith('# ') || text == "#"){
            title = text.substring(2).trim();
            resetCurrentCard()
            return;
        }

        if (text.startsWith('## ')){
            section = text.substring(3).trim();
            resetCurrentCard()
            return;
        }

        if (text.startsWith('### ')){
            question = text.substring(4).trim();
            resetCurrentCard()
            return;
        }

        card.title = title;
        card.section = section;
        card.question = question;
        card.answer.push(text.trim());
    });

    resetCurrentCard();
    return cards;
}

console.log(`Parsing ${dir}${searchRecursively ? " recursivly" : ""}`);
const mdFiles = parseDirectory(dir, searchRecursively);

var parsedCards = []

mdFiles.forEach(file => {
    var fileString = fs.readFileSync(file, {encoding: 'utf-8'});
    parsedCards = parsedCards.concat(parseText(fileString));
});

parsedCards.forEach(t => {
    const ans = t.answer;
    t.id = `${t.title}::${t.section}::${t.question}`
    t.answer = ans.join("\n");
})

fs.writeFileSync(process.cwd() + "/temp.json", JSON.stringify(parsedCards))

const converter = require('json-2-csv');

converter.json2csv(parsedCards, (err, csv) => {
    if (err) {
        throw err;
    }

    fs.writeFileSync(process.cwd() + `/generated-cards-${Date.now()}.csv`, csv)
}, {
    delimiter: {field: ';'}, 
    prependHeader: false
});