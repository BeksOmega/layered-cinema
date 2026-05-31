const banner = document.createElement('div');
banner.textContent = 'hello world';
banner.style.cssText = `
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff0000;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 6px;
  z-index: 9999999;
  pointer-events: none;
`;
document.body.appendChild(banner);
