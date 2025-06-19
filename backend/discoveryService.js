const express = require('express');
const app = express();

app.get('/api/backend-ip', (req, res) => {
    const backendUrl = 'http://localhost:3000'; // Configuration localhost
    console.log('Discovery service returning backend URL:', backendUrl);
    res.json({ backendUrl });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Discovery service running on port ${PORT}`);
});
