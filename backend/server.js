const app = require("./src/app");

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Warehouse Receiving API listening at http://localhost:${PORT}`);
});
