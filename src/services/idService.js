const Counter = require('../models/counter');

async function getNextSequence(name) {
    const doc = await Counter.findByIdAndUpdate(
        name,
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // upsert: Create the document if it doesn't exist; new: return the modified document rather than the original.
    ).lean();
    return doc.seq;
}

module.exports = { getNextSequence };