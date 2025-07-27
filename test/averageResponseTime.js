import fetch from 'node-fetch';

const BACKEND_URL = 'http://35.237.155.50:8080/generate';
const NUM_REQUESTS = 50;
const SEED_ARRAY = [
    { language: 'sinhala', seed_text: `විමල්ට​ වයස අවුරුදු 21 ක් වන` },
    { language: 'sinhala', seed_text: `සුසාන්ට කෑම පැකැට් 100ක් ඇති අතර` },
    { language: 'sinhala', seed_text: `මීයෙක් එක රැයකට සපත්තු` },
    { language: 'sinhala', seed_text: `ෆ්‍රෑන්ක් පසුගිය සතියේ දින 4ක් පුරා` },
    { language: 'sinhala', seed_text: `රෝසි​ ලිපි 13 ක් ලියන අතර` },
    { language: 'sinhala', seed_text: `අනුයාත  ඔත්තේ නිඛිල තුනක` },
    { language: 'sinhala', seed_text: `ඉලක්කම් දෙකක සංඛ්‍යාවක ඉලක්කම් දෙකෙහි` },
    { language: 'sinhala', seed_text: `සංඛ්‍යා තුනක එකතුව 137කි. දෙවන සංඛ්‍යාව` },
    { language: 'sinhala', seed_text: `ඉලක්කම් දෙකක අංකයක ඉලක්කම්වල එකතුව` },
    { language: 'sinhala', seed_text: `240 තුනෙන් බෙදූවිට` },
    { language: 'sinhala', seed_text: `එක් අංකයක් තවත් අංකයකට වඩා 5ක්` },
    { language: 'tamil', seed_text: `உண்டியலில் நிக்கல்கள் மற்றும் டைம்கள்` },
    { language: 'tamil', seed_text: `ஒரு தொட்டியை 2 மணி நேரத்தில் நிரப்ப முடியும்.` },
    { language: 'tamil', seed_text: `மூன்று தொடர்ச்சியான ஒற்றை முழு` },
    { language: 'tamil', seed_text: `இரண்டு இலக்க எண்ணின் இரண்டு இலக்கங்களின் கூட்டுத்தொகை` },
    { language: 'tamil', seed_text: `மூன்று எண்களின் கூட்டுத்தொகை 137. இரண்டாவது` },
    { language: 'tamil', seed_text: `ஒரு எலி ஒரே இரவில் ஒரு ஜோடி` },
    { language: 'tamil', seed_text: `ஃபிராங்க் கடந்த வாரம் 4 நாட்களில் 8 மணிநேரம்` },
    { language: 'tamil', seed_text: `ரோஸி 13 கடிதங்களை எழுதி 10` },
    { language: 'tamil', seed_text: `ஜோன் கடற்கரையில் 70 கடல் ஓடுகளைக் கண்டுபிடித்தார்.` },
    { language: 'tamil', seed_text: `விமல் ரோட்டிகளை தயாரித்தார், அவர் 2` },
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function measureResponseTime() {
  let totalTime = 0;
  let successCount = 0;
  // Prepare 50 random requests from SEED_ARRAY
  const requests = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const idx = Math.floor(Math.random() * SEED_ARRAY.length);
    requests.push(SEED_ARRAY[idx]);
  }
  shuffle(requests);

  for (let i = 0; i < requests.length; i++) {
    const payload = {
      language: requests[i].language,
      seed_text: requests[i].seed_text,
    };
    const start = Date.now();
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await response.json();
      const duration = Date.now() - start;
      totalTime += duration;
      successCount++;
      console.log(`Request ${i + 1}: ${duration} ms [${payload.language}]`);
    } catch (err) {
      console.error(`Request ${i + 1} failed:`, err.message);
    }
  }
  if (successCount > 0) {
    console.log(`\nAverage response time: ${(totalTime / successCount).toFixed(2)} ms over ${successCount} successful requests.`);
  } else {
    console.log('All requests failed.');
  }
}

measureResponseTime(); 