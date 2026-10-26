const http=require("http");
const server=http.createServer((req,res)=>{
    
    if (req.url === "/") {
        res.end("Welcome to Internship Tracker!");
    } else if (req.url === "/applications") {
        res.end("Here are your internship applications.");
    } else {
        res.writeHead(404);
        res.end("Route not found.");
    }

})
server.listen(3000, () => {
  console.log("Server running on port 3000");
});