const express = require('express');
const app = express();

app.get('/api/backend-ip', (req, res) => {
    const backendUrl = 'http://192.168.100.44:3000'; // Adresse IP mise à jour.
    console.log('Discovery service returning backend URL:', backendUrl); // Ajout d'un log.
    res.json({ backendUrl });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Discovery service running on port ${PORT}`);
});
