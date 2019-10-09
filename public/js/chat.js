const socket = io()
// element
const $messageForm = document.querySelector('#chat-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
// template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true})

const autoscroll = ()=>{
// New message element
const $newMessage = $messages.lastElementChild

// Height of the new message
const newMessageStyles = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
console.log(newMessageHeight)
// visible height
const visibleHeight = $messages.offsetHeight
// height of message container
const containerHeight = $messages.scrollHeight

// how far have  i scroll
const scrollOffset = $messages.scrollTop + visibleHeight
if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
}
}
// height of the message

// const $newMessage = 

// }
// socket.on('countUpdated',(count)=>{ this is first connection
//     console.log('the count has been Updated = ', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room, users})=>{
  const html = Mustache.render(sidebarTemplate,{
      room,
      users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    // const message1 = document.querySelector('name').value
    // disable
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    // socket.emit('sendMessage' , message)
    socket.emit('sendMessage' , message,(error)=>{
        // enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('the message deliverd')
    } )
})
$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geoloction is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        // console.log(position.coords.latitude)
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})
socket.emit('join', {username , room}, (error)=>{
if(error){
    alert(error)
    location.href = '/'
}
})