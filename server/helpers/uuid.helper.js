module.exports = {
  generate: () => {
    let d = new Date().getTime();
    return "xxxxxxxxxx".replace(/[xy]/g, (c) => {
      let r = Math.random() * 16;
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
    });
  },
};
