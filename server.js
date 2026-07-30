const e=require('express')
const a=e()
a.get('/',(q,r)=>r.redirect('https://haccp-app.netlify.app'))
a.listen(process.env.PORT||10000)
