export default function handler(req, res) {
  res.status(200).json({ message: "Proxy is working!", url: req.url });
}