import type { Metadata } from 'next'
import { getDevices, getIntegrations, getRecorderStatus, isCamera, type Integration } from '@/lib/home/data'
import { when } from '@/lib/home/format'
import { removeIntegration, setIntegrationEnabled } from '../../actions'
import { ConfirmSubmit, PendingButton } from '../../ui'
import styles from '../../home.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Settings' }

const STATUS: Record<string, { label: string; tone: string }> = {
  connected: { label: 'Connected', tone: styles.dotOk },
  starting: { label: 'Starting…', tone: '' },
  needs_setup: { label: 'Needs setup', tone: styles.dotWarn },
  error: { label: 'Can’t connect', tone: styles.dotBad },
  disabled: { label: 'Off', tone: '' },
  missing: { label: 'Removed from the code', tone: styles.dotWarn },
}

function IntegrationRow({ i, hostOnline }: { i: Integration; hostOnline: boolean }) {
  const st = !hostOnline && i.enabled ? { label: 'Worker offline', tone: styles.dotBad } : (STATUS[i.status] ?? STATUS.starting)
  return (
    <div className={styles.intRow}>
      <div className={styles.intMain}>
        <div className={styles.intName}>{i.name}</div>
        <div className={styles.intMeta}>
          <span className={`${styles.dot} ${st.tone}`} /> {st.label}
          {i.enabled && i.status === 'connected' ? ` · ${i.deviceCount} ${i.deviceCount === 1 ? 'device' : 'devices'}` : ''}
          {i.lastSeenAt ? ` · checked ${when(i.lastSeenAt)}` : ''}
        </div>
        {i.note && i.status !== 'connected' ? <div className={styles.intNote}>{i.note}</div> : null}
      </div>
      <div className={styles.intActions}>
        {i.status === 'missing' ? (
          <form action={removeIntegration}>
            <input type="hidden" name="id" value={i.id} />
            <ConfirmSubmit className={styles.btnDanger} message={`Remove ${i.name} and its devices from Home?`}>
              Remove
            </ConfirmSubmit>
          </form>
        ) : (
          <form action={setIntegrationEnabled}>
            <input type="hidden" name="id" value={i.id} />
            <input type="hidden" name="enabled" value={String(!i.enabled)} />
            <PendingButton
              className={`${styles.switch} ${i.enabled ? styles.switchOn : ''}`}
              label={`${i.name}: ${i.enabled ? 'on, turn off' : 'off, turn on'}`}
              pressed={i.enabled}
            >
              <span className={styles.switchKnob} />
            </PendingButton>
          </form>
        )}
      </div>
    </div>
  )
}

export default async function Settings() {
  const [integrations, recorder, devices] = await Promise.all([
    getIntegrations().catch(() => ({ list: [], hostOnline: false })),
    getRecorderStatus().catch(() => null),
    getDevices().catch(() => []),
  ])
  const cameras = devices.filter(isCamera).length

  return (
    <>
      <div className={styles.head}>
        <div className={styles.eyebrow}>Settings</div>
        <h1 className={styles.title}>Connected services</h1>
        <p className={styles.summary}>
          Ring is built in. Everything else is an integration: a folder in <code>integrations/</code> that you can add
          or delete. Turning one off here hides its devices until you turn it back on.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Built in</h2>
        </div>
        <div className={styles.intList}>
          <div className={styles.intRow}>
            <div className={styles.intMain}>
              <div className={styles.intName}>Ring</div>
              <div className={styles.intMeta}>
                <span className={`${styles.dot} ${recorder?.online ? styles.dotOk : styles.dotBad}`} />{' '}
                {recorder?.online ? 'Connected' : 'Recorder offline'} · {cameras} {cameras === 1 ? 'camera' : 'cameras'} ·
                house mode, floodlights, sirens
              </div>
              {!recorder?.online && recorder?.note ? <div className={styles.intNote}>{recorder.note}</div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Integrations</h2>
          {!integrations.hostOnline && integrations.list.length ? (
            <span className={styles.sectionLink}>The home-integrations worker isn’t running</span>
          ) : null}
        </div>
        {integrations.list.length ? (
          <div className={styles.intList}>
            {integrations.list.map((i) => (
              <IntegrationRow key={i.id} i={i} hostOnline={integrations.hostOnline} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No integrations have checked in yet.</div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.setup}>
          <div className={styles.setupTitle}>Add a service</div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.check}>1</span>
              <div className={styles.stepText}>
                Copy <code>integrations/_template</code> to <code>integrations/&lt;name&gt;</code> and fill in sign-in,
                devices and actions. The guide is <code>integrations/README.md</code>.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.check}>2</span>
              <div className={styles.stepText}>
                Add its packages to <code>integrations/requirements.txt</code> and its settings (for example{' '}
                <code>HUE_API_KEY</code>) to the home-integrations worker.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.check}>3</span>
              <div className={styles.stepText}>Deploy. It shows up here and its devices appear on the Home tab.</div>
            </li>
          </ol>
          <p className={styles.stepText}>
            To remove one, delete its folder and its line in <code>requirements.txt</code>, deploy, then press Remove here.
          </p>
        </div>
      </section>
    </>
  )
}
