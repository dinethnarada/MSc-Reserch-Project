import React, { useState } from 'react';
import { Box, Card, Typography, Radio, RadioGroup, FormControlLabel, Button, CircularProgress, TextField, Alert } from '@mui/material';

const BACKEND_URL = 'https://mwp-backend-service-108318652578.us-central1.run.app/generate';

export default function MWPGenerator() {
  const [language, setLanguage] = useState('Sinhala');
  const [seedText, setSeedText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSeedTextChange = (event) => {
    setSeedText(event.target.value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    setError('');
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language.toLowerCase(),
          seed_text: seedText,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate MWP');
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setResult('');
      } else if (data.generated_mwp) {
        setResult(data.generated_mwp);
        setError('');
      } else {
        setError('Unexpected response from server.');
        setResult('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ minWidth: 500, maxWidth: 700, mb: 3, p: 4, borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', border: '1px solid #aaa', borderRadius: 2, px: 3, py: 1 }}>MWP Generator</Typography>
        <Box sx={{ width: '100%', p: 3, border: '1px solid #ccc', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300 }}>
          <Typography sx={{ mb: 1 }}>Choose a Language</Typography>
          <RadioGroup row value={language} onChange={handleLanguageChange} sx={{ mb: 2 }}>
            <FormControlLabel value="Sinhala" control={<Radio />} label="Sinhala" />
            <FormControlLabel value="Tamil" control={<Radio />} label="Tamil" />
          </RadioGroup>
          <TextField
            label="Enter seed text"
            variant="outlined"
            value={seedText}
            onChange={handleSeedTextChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          />
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <CircularProgress size={32} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Generating</Typography>
            </Box>
          ) : (
            result && (
              <Box sx={{ width: '100%', minHeight: 40, mb: 2 }}>
                <Typography variant="body1">{result}</Typography>
              </Box>
            )
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={loading || seedText.trim() === ''}
            sx={{ mt: 2, minWidth: 120 }}
          >
            Generate
          </Button>
        </Box>
      </Card>
    </Box>
  );
} 