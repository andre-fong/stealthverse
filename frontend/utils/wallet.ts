function formatAddress(addr: `0x${string}`) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export { formatAddress };
