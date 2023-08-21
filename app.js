const cartBtn = document.querySelector('.cart-btn')
const cartItems = document.querySelector('.cart-items')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart ')
// const remove = document.querySelector(".remove-item")
const bagBtn = document.querySelector('.bag-btn')
const productsDOM = document.querySelector('.product-center')
// const itemAmount = document.querySelector(".item-amount")
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const navbar = document.querySelector('.navbar')

// create cart which is an empty array
let cart = []
// buttons
let buttonsDOM = []
// class used for getting the products
class Products {
  async getProducts() {
    try {
      let response = await fetch('product.json')
      let data = await response.json()
      console.log(data)

      // the you destructure by using map to get the items in the data json

      let products = data.items
      console.log(products)
      products = products.map((items) => {
        const { title, price } = items.fields
        // console.log(title)
        const { id } = items.sys
        const image = items.fields.image.fields.file.url
        console.log(products)

        return { title, price, id, image }
        // console.log(title, price, id, image)
      })
      return products
      // console.log(products)
    } catch (error) {
      console.log(error)
    }
  }
}

// display products class, responsible for returning items on the product  and displaying them
class Display {
  displayProducts(products) {
    let result = ''
    products.forEach((product) => {
      result += `<article class="product">
          <div class="img-container">
            <img src="${product.image}" alt="" class="product-img" />
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart addCart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4><i class="fa-solid fa-naira-sign"></i>${product.price}</h4>
        </article>`
    })
    productsDOM.innerHTML = result
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')]
    // console.log(buttons)
    buttons.forEach((button) => {
      let id = button.dataset.id
      // console.log(id)
      let inCart = cart.find((item) => item.id === id)
      // console.log(inCart)
      if (inCart) {
        button.innerText = 'In Cart'
        button.disabled = true
      }
      button.addEventListener('click', (e) => {
        // console.log(e)
        // e.target.innerText = 'In Cart'
        e.target.innerText = 'In Cart'
        e.target.disabled = true
        // get product from products from the local storage and start working with it(based on the id we will be getting from the button)
        let cartItem = { ...Storage.getProducts(id), amount: 1 }
        // this to get all the properties and values that you are getting then add the property amount:1
        // console.log(cartItem)

        // add product to cart
        cart = [...cart, cartItem]
        // console.log(cart)
        // save cart in local storage
        Storage.saveCart(cart)
        // set cart values
        this.setCartValue(cart)
        // display cart items
        this.addCartItem(cartItem)
        // show the cart
        this.showCart()
        this.closeCart()
      })
    })
  }
  setCartValue(cart) {
    let tempTotal = 0
    let itemsTotal = 0
    cart.map((item) => {
      tempTotal += item.price * item.amount
      itemsTotal += item.amount
    })
    cartTotal.innerText = tempTotal
    cartItems.innerText = itemsTotal
    // console.log(tempTotal)
    // console.log(itemsTotal)
  }
  // this is when we click the add to bag and it adds to the cart content parent element but we are now adding the method addCartItem to the cart-content dynamically
  addCartItem(item) {
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `<img src=${item.image} alt="" srcset="" />
            <div>
              <h3>${item.title}</h3>
              <h4><i class="fa-solid fa-naira-sign"></i>${item.price}</h4>
              <p class="remove-item" data-id=${item.id}>remove</p>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`
    cartContent.appendChild(div)
    // console.log(cartContent)
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
  }
  // closeCart() {
  //   closeCartBtn.addEventListener('click', () => {
  //     cartOverlay.classList.remove('transparentBcg')
  //     cartDOM.classList.remove('showCart')
  //   })
  // }
  setUp() {
    //  ie upon the load check what is the cart value if something is there assign the storage.getCart() else return an empty array.
    cart = Storage.getCart()
    // upon loading of the application once we have the cart values lets set  up the cart values that will be in the DOM
    this.setCartValue(cart)
    // if there are any items we can use the cart items and add to the cart
    this.populate(cart)
    // adding eventlisteners for the close cart button and the cart to close cart-overlay
    cartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }
  populate(cart) {
    cart.forEach((item) => this.addCartItem(item))
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
  }
  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        cart = cart.filter((item) => item.id !== id)
        console.log(cart)

        this.setCartValue(cart)
        Storage.saveCart(cart)
        // traverse DOM
        cartContent.removeChild(removeItem.parentElement.parentElement)
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttons.forEach((button) => {
          if (parseInt(button.dataset.id) === id) {
            button.disabled = false
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`
          }
        })
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target
        let id = addAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount + 1
        Storage.saveCart(cart)
        this.setCartValue(cart)
        addAmount.nextElementSibling.innerText = tempItem.amount
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find((item) => item.id === id)
        tempItem.amount = tempItem.amount - 1
        if (tempItem.amount > 0) {
          Storage.saveCart(cart)
          this.setCartValue(cart)
          lowerAmount.previousElementSibling.innerText = tempItem.amount
        } else {
          cart = cart.filter((item) => item.id !== id)
          // console.log(cart);

          this.setCartValue(cart)
          Storage.saveCart(cart)
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          const buttons = [...document.querySelectorAll('.bag-btn')]
          buttons.forEach((button) => {
            if (parseInt(button.dataset.id) === id) {
              button.disabled = false
              button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`
            }
          })
        }
      }
    })
  }
  clearCart() {
    // console.log(this);

    cart = []
    this.setCartValue(cart)
    Storage.saveCart(cart)
    const buttons = [...document.querySelectorAll('.bag-btn')]
    buttons.forEach((button) => {
      button.disabled = false
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`
    })
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }
}

// local storage to store them
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products))
  }
  // require the arguement id gotten from the button
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'))
    // console.log(products)
    return products.find((product) => product.id === id)
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getCart() {
    // first we check whether the item in the local storage exists by setting getItem("cart") ie if weve added something already to the local storage its still gonna exist after refreshing the page! using ternary operator(?:) we say if the item is there then we return the array ie using json.parse then if the item doesnt exist we just return  an empty array
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : []
  }
}

// add eventlistener for domcontent ie when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // calling your functions from the constructors
  const disp = new Display()
  const products = new Products()
  // setUp this is done so when we load the site the items whoch are already in cart will still remain in  the cart thus why we place it before the products.
  disp.setUp()

  // getting all products, .the method name
  products
    .getProducts()
    .then(function (products) {
      disp.displayProducts(products)
      // calling the saveProducts then passing the products
      Storage.saveProducts(products)
    })
    .then(() => {
      disp.getBagButtons()
      disp.cartLogic()
    })
})

window.addEventListener('scroll', () => {
  const windowHeight = window.pageYOffset
  // console.log(windowHeight)
  const navHeight = navbar.getBoundingClientRect().height
  // console.log(navHeight)
  if (windowHeight > 60) {
    navbar.classList.add('fixed-nav')
  }
})

const scrollLink = document.querySelector('.scroll-link')

scrollLink.addEventListener('click', (e) => {
  e.preventDefault()
  const id = e.currentTarget.getAttribute('href').slice(1)
  const element = document.getElementById(id)
  const navHeight = navbar.getBoundingClientRect().height
  let position = element.offsetTop - navHeight
  fixedNav = navbar.classList.contains('fixed-nav')

  window.scrollTo({
    left: 0,
    top: position,
  })
  if (fixedNav) {
    position = position - navHeight
  }
})
