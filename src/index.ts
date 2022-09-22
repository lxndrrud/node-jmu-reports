import { Bootstrap } from './app'

function Start() {
    Bootstrap()
    .then(app => {
        app.listen(8080, () => {
            console.log(`⚡️[server]: Сервер Приказов работает на http://localhost:8080`)
        })
    })
}

Start()
