let listaMenu = [];
let pedidos = [];
let total = 0;


let divPadreMenu = document.querySelector("#vistaMenu");
let divPadre = document.querySelector("#generalBack");
let ulMenu = document.createElement("ul");
let divPadrePedidos = document.querySelector("#sec-pedidos");
let vistaPedidos = document.createElement("div");
vistaPedidos.setAttribute("id", "vistaPedidos");
let buscadorPedidos = document.querySelector("#buscador");
let modalPedidos = document.querySelector(".pedido");
let modalTotal = document.querySelector("#totalPedido");
let finPedido = document.querySelector("#finPedido");
let modalDetalle = document.querySelector(".detalle")





divPadre.addEventListener("click", ordenarMenues);
divPadreMenu.addEventListener("click", agregarMenues);
buscadorPedidos.addEventListener("submit", buscarPedidos);
finPedido.addEventListener("click", pedidoFinalizado);
$("#sec-pedidos").click(borrarPedido);
$("#vistaMenu").click(detalleMenu);




document.addEventListener('DOMContentLoaded', () => {
    let storagePedido = JSON.parse(localStorage.getItem('pedidos'));
    pedidos = storagePedido || [];

    $.ajax({
        method: 'GET',
        dataType: 'JSON',
        url: 'js/menu.json',
        success: function(menues) {
            listaMenu = menues;
            inicioMenu(listaMenu)
            console.log("funcionando")
        },
        error: function(xhr, textStatus, error) {
            console.log(xhr);
            console.log(textStatus);
            console.log(error);
        }});

    mostrarPedidos();
});

function ordenarMenues(e) {
    if (e.target.classList.contains("btn-success")) {
        ordenarPorMayor();
        divPadreMenu.innerHTML = "";
        for (i = 0; i < listaMenu.length; i++) {
            let liMenu = document.createElement("div");
            liMenu.innerHTML = `
        <div  class="card">
        <div id="id" hidden>${listaMenu[i].id}</div>
        <img class="mb-0 img " src="${listaMenu[i].img}" >
        <text class="mb-0 menu ">${listaMenu[i].nombreComida}</text>
        <text class="mb-0  ">$${listaMenu[i].precioComida}</text>
        <text class="precio" hidden>${listaMenu[i].precioComida}</text>
        <i class="fas fa-plus-square "></i>
        <button data-id="${listaMenu[i].id}" type="button" class="btn btn-warning" data-toggle="modal" data-target="#detalle">Detalle</button>
        </div>
        `;
            divPadreMenu.appendChild(liMenu);
        };

    } else if (e.target.classList.contains("btn-primary")) {
        ordenarPorMenor();
        divPadreMenu.innerHTML = "";
        for (i = 0; i < listaMenu.length; i++) {
            let liMenu = document.createElement("div");
            liMenu.innerHTML = `
        <div  class="card">
        <div id="id" hidden>${listaMenu[i].id}</div>
        <img class="mb-0 img " src="${listaMenu[i].img}" >
        <text class="mb-0 menu ">${listaMenu[i].nombreComida}</text>
        <text class="mb-0  ">$${listaMenu[i].precioComida}</text>
        <text class="precio" hidden>${listaMenu[i].precioComida}</text>
        <i class="fas fa-plus-square "></i>
        <button data-id="${listaMenu[i].id}" type="button" class="btn btn-warning" data-toggle="modal" data-target="#detalle">Detalle</button>
        </div>
        `;
            divPadreMenu.appendChild(liMenu);
        }
    }
}

function agregarMenues(e) {

    if (e.target.classList.contains("fa-plus-square")) {
        const menuSeleccionado = e.target.parentElement;
        let pedidoAgregado = {
            imagen: menuSeleccionado.querySelector("img.img").src,
            nombre: menuSeleccionado.querySelector("text.menu").textContent,
            precio: menuSeleccionado.querySelector("text.precio").textContent,
            cantidad: 1,
            id: menuSeleccionado.querySelector("#id").textContent
        };

        const pedidoExistente = pedidos.some(pedido => pedido.nombre === pedidoAgregado.nombre);

        if (pedidoExistente) {
            const nuevoPedido = pedidos.map(pedido => {
                if (pedido.nombre === pedidoAgregado.nombre) {
                    pedido.cantidad++
                };
                return pedido;
            });
            pedidos = [...nuevoPedido];
        } else {
            pedidos.push(pedidoAgregado);
        };

        pedidosStorage();
        mostrarPedidos();
        let agregadoAlert = document.querySelector("#agregado");
        agregadoAlert.innerHTML = `
        <h3 id="tuPedido">
        se agrego a tu pedido :${menuSeleccionado.querySelector("text.menu").textContent}
        </h3>
        `;

        $("#sec-pedidos").fadeOut(1000, () => $("#sec-pedidos").fadeIn(2000));
        $("#agregado").show(1500, () => $("#agregado").hide(5000));
        $("html").animate({ scrollTop: 0 }, "slow");
    }};

function mostrarPedidos() {
    divPadrePedidos.innerHTML = "";
    vistaPedidos.innerHTML = "";
    let borrarPedido = document.createElement('div');
    borrarPedido.innerHTML = `
    <button id="borrar" type="button" class="btn btn-danger">Cancelar Pedido</button>
    <button id="okPedido" type="button" class="btn btn-primary" data-toggle="modal" data-target="#pedidoOk">Realizar Pedido</button>
    `;

    for (i = 0; i < pedidos.length; i++) {
        let liPedidos = document.createElement("div");
        liPedidos.innerHTML = `
        <div  id="pedidos" data-id="${pedidos[i].id}" >
        <div id="cardPedidos"  class="card">
        <img src="${pedidos[i].imagen}" 
        <p>${pedidos[i].nombre}
        $${pedidos[i].precio}
        Cantidad:${pedidos[i].cantidad}</p>
        <i data-id="${pedidos[i].id}"  class="fas fa-trash col-1" ></i>
        </div>
        </div
        `;
        vistaPedidos.appendChild(liPedidos);
    };
    valorTotal();
    let divTotal = document.createElement("div");
    divTotal.innerHTML = (`Pedido Total:$${total}`);
    divPadrePedidos.appendChild(divTotal);
    divPadrePedidos.appendChild(vistaPedidos);
    divPadrePedidos.appendChild(borrarPedido);
    let btnBorrarPedidos = document.querySelector("#borrar");
    btnBorrarPedidos.addEventListener('click', eliminarPedidos);
    let btnOkPedidos = document.querySelector("#okPedido");
    btnOkPedidos.addEventListener('click', pedidoOK);
};

function pedidoOK(e) {
    valorTotal();

    modalPedidos.innerHTML = "";

    modalTotal.innerHTML = (`Total:$${total}`);
    pedidos.forEach(pedido => {
        let { nombre, precio, cantidad } = pedido
        $(".pedido").append(`
        <tr>
		 <td>
		 ${nombre}, cantidad:${cantidad} , $${Number(precio) * cantidad}
		 </td>
		</tr>
        `)
    })
};

function pedidoFinalizado() {
    modalTotal.innerHTML = "";
    modalPedidos.innerHTML = `
    <p>Su pedido fue realizado con exito!</p>
    <p>En breves llegara a su destino.</p>
    <p>Muchas Gracias</p>
    `;

    pedidos = [];
    localStorage.clear();
    mostrarPedidos();
    inicioMenu(listaMenu);
};

function buscarPedidos(e) {
    console.log("ok");
    e.preventDefault();
    let inputBuscador = document.querySelector("#inputBuscador").value;
    let productoBuscado = inputBuscador.toLowerCase().trim();

    let busqueda = listaMenu.filter(menu => menu.nombreComida.toLowerCase().includes(productoBuscado));

    inicioMenu(busqueda);
    buscadorPedidos.reset();
};

function borrarPedido(e) {

    let pedidoId = Number(e.target.closest(".fas").dataset.id);
    let pedidoEliminado = pedidos.find(pedido =>
        pedido.id == pedidoId);
    console.log(pedidoEliminado)
    let pedidoTotal = pedidos.filter(pedido =>
        pedido.id != pedidoId
    )
    pedidos = [...pedidoTotal];

    pedidosStorage();

    mostrarPedidos();

    let agregadoAlert = document.querySelector("#borrado");
    agregadoAlert.innerHTML = `
        <h3 id="tuPedido">
        se borro de tu pedido: ${pedidoEliminado.nombre}
        </h3>
        `;
    $("#sec-pedidos").fadeOut(1000, () => $("#sec-pedidos").fadeIn(2000));
    $("#borrado").show(1500, () => $("#borrado").hide(5000));
};

function eliminarPedidos(e) {

    pedidos = [];
    localStorage.clear();
    mostrarPedidos();
    inicioMenu(listaMenu);
};

function pedidosStorage() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
};

function inicioMenu(listaMenu) {
    divPadreMenu.innerHTML = "";
    for (i = 0; i < listaMenu.length; i++) {
        let liMenu = document.createElement("div");
        liMenu.innerHTML = `
        <div  class="card">
        <div id="id" hidden>${listaMenu[i].id}</div>
        <img class="mb-0 img " src="${listaMenu[i].img}" >
        <text class="mb-0 menu ">${listaMenu[i].nombreComida}</text>
        <text class="mb-0  ">$${listaMenu[i].precioComida}</text>
        <text class="precio" hidden>${listaMenu[i].precioComida}</text>
        <i class="fas fa-plus-square "></i>
        <button data-id="${listaMenu[i].id}" type="button" class="btn btn-warning" data-toggle="modal" data-target="#detalle">Detalle</button>
        </div>
        `;
        divPadreMenu.appendChild(liMenu);
    };
};

function detalleMenu(e) {
    modalDetalle.innerHTML = "";
    let nombreModal = document.querySelector(".nombreDet")
    let precioModal = document.querySelector("#precioDet")
    let menuId = (e.target.closest(".btn").dataset.id);
    let menuDet = listaMenu.find(menu =>
        menu.id == menuId)
    console.log((menuDet));

    modalDetalle.innerHTML = `
    <div id="detalleModal" class="card"tyle="width: 18rem;">
  <img class="card-img-top" src="${menuDet.img}" alt="Card image cap">
  <div class="card-body">
    <p class="card-text">${menuDet.detalleComida}</p>
  </div>
</div>
    `
    nombreModal.textContent = `${ menuDet.nombreComida }`;
    precioModal.textContent = `Precio:$${ menuDet.precioComida }`;
};

function ordenarPorMenor() {
    return listaMenu.sort((a, b) => a.precioComida - b.precioComida);
};

function ordenarPorMayor() {
    return listaMenu.sort((a, b) => b.precioComida - a.precioComida);
};

function valorTotal() {
    total = 0;
    for (let menu of pedidos) {
        total += Number(menu.precio) * Number(menu.cantidad);
    }
    return Number(total);
};


console.log("App funcionando");