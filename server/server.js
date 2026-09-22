import app from './app.js';
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`Supabase-backed Good Day Coffee API listening on http://localhost:${port}`);
});
