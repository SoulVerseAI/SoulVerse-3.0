for (const [key, value] of Object.entries(process.env)) {
  if (value && value.includes('\0')) {
    console.log(`NUL character found in ${key}`);
  }
}
console.log("Check complete.");
