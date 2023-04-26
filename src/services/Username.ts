import { Username } from "../entities"


export const generateUsername = async () => {
    // Define arrays of adverbs, adjectives, and nouns
    const query = Username.createQueryBuilder('username')
        .select('username.adjective', 'adjective')
        .addSelect('username.adverbs', 'adverb')
        .addSelect('username.nouns', 'noun');
    const results = await query.getRawMany();

    const adjectives = results.map(result => result.adjective).filter(Boolean);
    const adverbs = results.map(result => result.adverb).filter(Boolean);
    const nouns = results.map(result => result.noun).filter(Boolean);

    // Generate a random number between 1 and 4 to choose the rule
    const ruleNumber = Math.floor(Math.random() * 4) + 1;
    console.log(ruleNumber)
    switch (ruleNumber) {
        case 1:
            // Choose a random adverb, adjective, and noun
            const adverb1 = adverbs[Math.floor(Math.random() * adverbs.length)];
            const adjective1 = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun1 = nouns[Math.floor(Math.random() * nouns.length)];

            // Return the string "adverb adjective noun"
            return `${adverb1}${adjective1}${noun1}`;
        case 2:
            // Choose two random adjectives and a noun
            const adjective2a = adjectives[Math.floor(Math.random() * adjectives.length)];
            const adjective2b = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun2 = nouns[Math.floor(Math.random() * nouns.length)];

            // Return the string "adjective adjective noun"
            return `${adjective2a}${adjective2b}${noun2}`;
        case 3:
            // Choose a random adverb and two random nouns
            const adverb3 = adverbs[Math.floor(Math.random() * adverbs.length)];
            const noun3a = nouns[Math.floor(Math.random() * nouns.length)];
            const noun3b = nouns[Math.floor(Math.random() * nouns.length)];

            // Return the string "adverb noun noun"
            return `${adverb3}${noun3a}${noun3b}`;
        case 4:
            // Choose a random adjective and two random nouns
            const adjective4 = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun4a = nouns[Math.floor(Math.random() * nouns.length)];
            const noun4b = nouns[Math.floor(Math.random() * nouns.length)];

            // Return the string "adjective noun noun"
            return `${adjective4}${noun4a}${noun4b}`;
        default:
            // This should never happen, but just in case
            return '';
    }
}