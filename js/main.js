
    const text = "👋 ¡Hola! Soy desarrollador de software .NET con más de 5 años de experiencia en la creación de APIs, Desktop Apps y WebApps.";
    let index = 0;
    const speed = 50;

    function typeWriter() {
        if (index < text.length) {
            document.getElementById("description").innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, speed);
        }
    }

    window.onload = typeWriter;

