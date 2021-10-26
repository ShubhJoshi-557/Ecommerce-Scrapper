document.querySelectorAll(".button2").forEach((item) => {
    item.addEventListener("click", async() => {
        item.style.backgroundColor = "red";
        var curr_url = item.getAttribute('id');
        console.log(item.getAttribute('id'));
        curr_url = curr_url.replaceAll("/","__uwu__");
        curr_url = curr_url.replaceAll("?","__uvu__");
        let xhr = new XMLHttpRequest();
            xhr.open("GET","http://localhost:3000/api/"+curr_url);
            xhr.send();
            xhr.onload = ()=>{
                console.log(xhr.responseURL);
            }
        
    })
});