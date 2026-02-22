const fs = require('fs');
const path = require('path');

const stateFile = path.resolve(__dirname, 'ops/launch-command-deck/data/state.json');

if (!fs.existsSync(stateFile)) {
    console.error(`State file not found at ${stateFile}`);
    process.exit(1);
}

const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
let updated = false;

state.boards.forEach(board => {
    const codename = board.codename;
    let nextNum = board.nextIssueNumber || 1;

    board.cards.forEach(card => {
        if (!card.issueNumber) {
            const issueNumber = `${codename}-${String(nextNum).padStart(3, '0')}`;
            console.log(`Assigning ${issueNumber} to card: ${card.title}`);
            card.issueNumber = issueNumber;
            nextNum++;
            updated = true;
        }
    });

    if (updated) {
        board.nextIssueNumber = nextNum;
        board.updatedAt = new Date().toISOString();
    }
});

if (updated) {
    state.updatedAt = new Date().toISOString();
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n', 'utf8');
    console.log(`Successfully backfilled issue numbers. Next issue number is now ${state.boards[0].nextIssueNumber}.`);
} else {
    console.log('No cards needed backfilling.');
}
