const goTopBtn = document.querySelector(".go-top");

if(goTopBtn){
    
    goTopBtn.addEventListener("click", goTop);
    window.addEventListener("scroll", trackScroll);
    function trackScroll() {
        const scrolled = window.pageYOffset;

        if (scrolled > 200) {
            goTopBtn.classList.add("go-top--show");
        } else {
            goTopBtn.classList.remove("go-top--show");
        }
    }

    function goTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}