/* =========================================================
   CONFIGURACIÓN — todo lo personalizable está acá
   ========================================================= */
window.CONFIG = {
  ella: "Elina",
  yo: "Benja",

  // Contraseña del candado
  pin: "1111",

  // Día que se pusieron de novios (hora Argentina)
  inicio: "2026-07-24T00:00:00-03:00",

  // Canción (poner el archivo en /musica con este nombre)
  cancion: "musica/Nuestro-Camino.mp3",

  // Frases que se forman con partículas al principio.
  // "{corazon}" dibuja un corazón con partículas.
  frases: [
    "Hola, mi amor",
    "Hoy cumplimos 3 meses",
    "24 . 07 . 2026",
    "y te hice algo",
    "{corazon}"
  ],

  // Palabras que flotan alrededor de la galaxia
  palabrasGalaxia: [
    "Te amo", "Siempre", "Mi lugar", "Infinito", "Nuestro camino",
    "Elina", "Mi persona", "Para siempre", "3 meses", "Mi luna",
    "Juntos", "Te elijo", "Mi amor", "Contigo"
  ],

  // Fotos: archivos en /fotos, en orden desde que se conocieron.
  // "texto" es lo que aparece debajo de la polaroid (vacío = sin texto).
  fotos: [
    { src: "fotos/foto1.jpeg", texto: "El día que nos pusimos de novios" },
    { src: "fotos/foto2.jpeg", texto: "" },
    { src: "fotos/foto3.jpeg", texto: "" },
    { src: "fotos/foto4.jpeg", texto: "" },
    { src: "fotos/foto5.jpeg", texto: "" },
    { src: "fotos/foto6.jpeg", texto: "" },
    { src: "fotos/foto7.jpeg", texto: "" },
    { src: "fotos/foto8.jpeg", texto: "" },
    { src: "fotos/foto9.jpeg", texto: "" }
  ],

  /* ------------------ LA CARTA ------------------
     Cada string del array "parrafos" es un párrafo.  */
  carta: {
    saludo: "Mi amor, felices 3 meses.",
    // **texto** = negrita
    parrafos: [
      "Quién diría que en tan poquito tiempo ibas a convertirte en una persona tan importante para mí. A veces me pongo a pensar en todo lo que vivimos desde que empezamos esto tan lindo y me doy cuenta de que, aunque solamente hayan pasado tres meses, siento que compartimos muchísimo más que tiempo. Compartimos sentimientos, momentos, risas, enojos, diferencias, reconciliaciones y, sobre todo, un amor que cada día se hace más grande.",
      "Sé que no todo ha sido fácil. Hemos peleado, tuvimos nuestras diferencias y hubo momentos en los que quizás nos costó entendernos. Pero si hay algo que me hace feliz de nosotros es que, a pesar de todo, siempre encontramos la manera de volver a acercarnos, de escucharnos y de resolver las cosas. Porque para mí amar no significa estar de acuerdo en todo ni tener una relación perfecta, sino tener a alguien con quien valga la pena aprender, mejorar y seguir construyendo, incluso en los días difíciles. Y yo quiero eso con vos, mi amor. Quiero seguir aprendiendo a amarte cada vez mejor.",
      "También quiero darte las gracias por acompañarme en esta etapa de mi vida. Estos días de parciales, de cansancio, de preocupaciones y de tener la cabeza en mil cosas serían muy distintos sin vos. Gracias por estar, por darme tu amor, por hacerme compañía incluso a la distancia y por formar parte de mi vida en un momento en el que estoy intentando crecer, estudiar y construir mi futuro. Quizás no siempre me salga demostrarte todo lo que significás para mí, pero quiero que sepas que tenerte a mi lado es algo que valoro muchísimo. Sos parte de mis días, de mis ganas y de muchos de los sueños que me ilusionan.",
      "Y si hay algo que me emociona de nosotros es saber que, aunque todavía nos toque extrañarnos, ya falta un poquito menos para ese momento en el que no tengamos que despedirnos a través de una pantalla, en el que pueda abrazarte cuando quiera, darte un beso porque sí, verte después de un día largo y compartir con vos esas pequeñas cosas que hoy tanto extrañamos. No veo la hora de que llegue ese momento en el que estar juntos deje de ser algo que esperamos y se convierta en parte de nuestra vida cotidiana. Quiero vivir los días lindos con vos, pero también quiero estar cuando tengas un mal día, acompañarte en tus batallas, escucharte y abrazarte hasta que todo se sienta un poquito mejor.",
      "Y hay una frase que me encanta porque siento que representa algo muy nuestro: **el océano nos conecta**. Porque, aunque haya kilómetros entre nosotros, aunque a veces la distancia pese y quisiéramos tenernos cerquita, hay algo que sigue uniéndonos. Hay un amor que no entiende de kilómetros, que encuentra maneras de hacerse presente y que nos recuerda que estamos construyendo algo juntos, incluso cuando no podemos tocarnos. Y me gusta pensar que todo este tiempo de extrañarnos va a hacer que valoremos todavía más cada abrazo, cada beso y cada momento que podamos compartir.",
      "Mi amor, gracias por estos tres meses, por tu cariño, por tu paciencia, por tu forma de hacerme sentir amado y por dejarme formar parte de tu vida. Gracias por ser vos, con todo lo lindo que tenés y también con esas cositas que vamos aprendiendo a entender el uno del otro. No quiero prometerte que nunca vamos a discutir ni que siempre voy a saber qué hacer, pero sí quiero prometerte que voy a seguir intentando, que voy a cuidar lo nuestro y que voy a elegirte también cuando las cosas no sean tan fáciles. Porque lo que siento por vos merece eso y mucho más.",
      "Ojalá cuando miremos hacia atrás podamos recordar estos primeros meses y sonreír, sabiendo que fueron el comienzo de una historia hermosa. Que podamos decir que, a pesar de la distancia, de las peleas y de todas las cosas que tuvimos que aprender, nunca dejamos de apostar por nosotros. Y que esto sea solamente el principio de muchísimos meses, años y momentos que todavía nos quedan por vivir.",
      "Te amo muchísimo, Elina Maria. Más de lo que a veces me salen las palabras para explicarte. Me hace feliz que seas vos la persona con la que estoy viviendo todo esto, y me hace todavía más feliz pensar en todo lo que nos queda por delante.",
      "**Felices tres meses, mi amor.** Que sean los primeros de muchísimos más, que nunca nos falten las ganas de encontrarnos, de entendernos y de volver a elegirnos. Y que, mientras llega el día en que podamos estar juntos todos los días, nunca nos olvidemos de que, de alguna manera, el océano nos conecta."
    ],
    despedida: "Te amo, hoy, mañana y en todos esos días que todavía nos quedan por compartir.",
    firma: "Benja"
  }
};
