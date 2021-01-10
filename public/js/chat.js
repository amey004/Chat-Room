const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//templates
const messageTemplate =  document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll = () =>{
    //new message element
    const newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //how far we have scrolled  
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight 
    }

}

socket.on('locationMessage',(message)=>{
    console.log(message.url)
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('HH:mm ')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})

socket.on('Message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disbale
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message
    socket.emit('SendMessage',message.value,(error)=>{

        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!')
    })
})

$locationButton.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }
    $locationButton.setAttribute("disabled", "disabled");
    
    navigator.geolocation.getCurrentPosition((position)=>{
        
        let lat = position.coords.latitude
        let long = position.coords.longitude
        socket.emit('sendLocation',lat,long,()=>{
            $locationButton.removeAttribute("disabled");
            console.log('Location Shared!')
        })
    })
})

socket.emit('join',username,room,(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})