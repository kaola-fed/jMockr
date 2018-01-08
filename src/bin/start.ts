import * as packageData from '../../package.json'
import * as parseArgv from 'minimist'
import * as chalk from 'chalk'
import mockDataWatcher from '../watcher/mockDataWatcher'
import pageWatcher from '../watcher/pageWatcher'
import app from '../app'
import { migrate } from '../util/migrate'

const args: any = parseArgv(process.argv.slice(2))
enum AvailableFullCommands {
    help = 'help',
    migrate = 'migrate',
    normal = 'normal',
    live = 'live',
    start = 'start',
    version = 'version',
}

enum AvailableShortCommands {
    h = 'h',
    m = 'm',
    n = 'n',
    l = 'l',
    s = 's',
    v = 'v',
}

index(args)

function index(args: { [key: string]: boolean }): void {
    sayHi()
    if (argsUnknown(args) || args.h || args.help) {
        showHelp()
    } else if (args.v || args.version) {
        console.info((packageData as any).version)
        process.exit(0)
    } else if (args.m || args.migrate) {
        migrate()
    } else {
        app.start()
        if (args.n || args.normal) {
            return // Normal start, no file change detect.
        }

        mockDataWatcher.addListener(() => {
            console.info('Mock data changed, restart server...')
            app.restart()
        })
        if (args.s || args.start) {
            return // Only restart when mock data changed.
        }

        // Reload when page content changed.
        pageWatcher.addListener(() => {
            app.reloadPages()
        })
    }
}

function sayHi(): void {
    const welcomeMsg: string = '\n============Welcome using jMockr============'
    console.info(chalk.bgGreen.bold(welcomeMsg))
}

function argsUnknown(args: { [key: string]: boolean }): boolean {
    return Object.keys(args).every((name: string): boolean => {
        return !(name in AvailableFullCommands) && !(name in AvailableShortCommands)
    })
}

function showHelp(): void {
    console.info('=======================================')
    console.info('-h, --help\tshow help')
    console.info('-n, --normal\t普通启动, 修改mock数据或页面代码, 不会重启服务器')
    console.info('-s, --start\t热启动, 修改mock数据会触发jmockr重启')
    console.info('-l, --live\t带有live reload功能的热启动, 修改页面代码时会自动刷新浏览器')
    console.info('=======================================')
}
