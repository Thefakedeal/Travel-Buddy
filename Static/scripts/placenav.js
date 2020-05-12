let sidebar= document.querySelector('.sidebar');
let showAside= document.getElementById('showAside');
let goBack= document.getElementById('goBack');


    showAside.addEventListener('click', (event)=>{
        
        if(sidebar.style.display!=='flex')
        {
            sidebar.style.display='flex'; 
            showAside.style.transform= 'rotate(180deg) translateY(5px)';
            
        } 
        else
        {
            sidebar.style.display='none';
            showAside.style.transform= 'rotate(0deg)';            
        }

    });

    goBack.addEventListener('click', (event)=>{
        window.location='/..';
    });


    const elem=document.querySelector('main')

    
    elem.addEventListener('scroll', e=>{
        if(Math.floor(e.target.offsetHeight+e.target.scrollTop)==e.target.scrollHeight){

        }
    })