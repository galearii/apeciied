# Moving apeciied.org from Wix to Gandi without downtime

Research for galearii/apeciied#2 (map: #1). Researched 2026-11-22 against the
Wix Help Center, Gandi docs and Netlify docs, plus live `dig`/`whois` output.

## TL;DR

- **Launch on Netlify while the domain is still at Wix: yes.** Wix lets you
  edit the root A record and the `www` CNAME of a Wix-registered domain to point
  at an external host. Wix doesn't document ALIAS records, so the apex uses
  Netlify's fallback A record `75.2.60.5`. All three current Wix A records must
  go, because more than one apex A record breaks Netlify's certificate.
- **The registrar transfer is where downtime can happen, not the launch.** If
  the domain still uses Wix nameservers when it leaves Wix, Gandi keeps those
  nameservers by default. Gandi warns the domain goes offline if the old host
  stops serving DNS, and Wix says DNS is no longer its job after the transfer.
- **Recommendation: move DNS to Netlify DNS before starting the transfer.**
  Wix supports custom nameservers on a domain it still registers. Once DNS sits
  at Netlify, the transfer only changes the registrar, and Gandi keeps the
  Netlify nameservers. This is in place of "recreate DNS at Gandi". Gandi
  LiveDNS stays an option afterwards (see the last section).
- **Cost and term:** the Gandi .org transfer is EUR 15.20 excluding VAT and adds
  one year: expiry goes from 2028-03-20 to 2029-03-20. Later Gandi renewals are
  EUR 31.98 a year excluding VAT (list price on the day of research).
- **Wix plan:** the Premium plan and the domain are separate subscriptions.
  Cancelling the plan doesn't cancel or release the domain. Cancelling after 14
  days only stops renewal, and the plan runs to the end of its cycle. The
  agreed order (cancel last) is safe. Cancelling earlier would also be safe once
  the domain is unassigned from the Wix site.

## Current state (observed 2026-11-22)

| Item | Value |
|---|---|
| Registrar | Tucows (via Wix), created 2022-03-20, expires 2028-03-20 |
| Status | `clientTransferProhibited`, `clientUpdateProhibited` (locked) |
| Registrant | `Contact Privacy Inc. Customer ...`, so Wix private registration is ON |
| DNSSEC | unsigned |
| NS | `ns14.wixdns.net`, `ns15.wixdns.net` |
| Apex A | `185.230.63.107`, `185.230.63.171`, `185.230.63.186` (TTL 3600) |
| `www` | CNAME `cdn3.wixdns.net` (TTL 3600) |
| AAAA, MX, TXT, CAA | none |

The site's canonical host today is `www.apeciied.org` (see `AGENTS.md`).

## 1. Can Wix DNS point at Netlify before the transfer?

Yes.

- Wix documents pointing a Wix domain at an external site: an A record for the
  root domain and a CNAME for `www`. It also says to delete the old A and CNAME
  records after adding the new ones. DNS changes can take up to 48 hours.
  [Wix: Connecting a Wix Domain to an External Site via Pointing](https://support.wix.com/en/article/connecting-a-wix-domain-to-an-external-site)
- Wix's DNS editor handles A, AAAA, CNAME, MX, TXT, SPF, SRV and NS records.
  ALIAS/ANAME isn't listed. The same page notes that the `www` host name is
  "reserved for connecting a Wix site only". Read with the pointing article,
  that seems to refer to the domain while it is still assigned to a Wix site.
  You can export the zone as CSV or BIND.
  [Wix: Managing DNS Records](https://support.wix.com/en/article/managing-dns-records-in-your-wix-account)
- If a domain points at a non-Wix site, it shouldn't also be assigned to a Wix
  site; unassign it. Unassigning disconnects the domain from the Wix site
  instantly. Wix domains can't be removed from the account, only unassigned or
  transferred.
  [Wix: Unassigning a Domain from Your Site](https://support.wix.com/en/article/unassigning-a-domain-from-your-site)
- Netlify's external-DNS records: for the apex, an ALIAS/ANAME/flattened CNAME
  to `apex-loadbalancer.netlify.com` is preferred, with an A record to
  `75.2.60.5` as the fallback. For `www`, a CNAME to `<site>.netlify.app`.
  Adding either the apex or `www` to a site adds both. Netlify recommends a
  subdomain (`www`) as the primary domain with external DNS, because the apex
  can't use CDN direct routing.
  [Netlify: Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)
- Certificate pitfalls: "Multiple A records on the apex domain will cause
  certificate failures"; remove AAAA records (no IPv6 on the load balancer); a
  CAA record must allow Let's Encrypt. Netlify retries issuance every 10 minutes
  for 24 hours, then hourly for two days.
  [Netlify: Troubleshoot SSL and HTTPS](https://docs.netlify.com/manage/domains/troubleshooting/troubleshoot-ssl-and-https/)

For apeciied.org this means: delete all three Wix A records and add one
`A @ 75.2.60.5`, then change `www` from `cdn3.wixdns.net` to
`<site>.netlify.app`. No AAAA or CAA records exist, so nothing else blocks the
certificate. Keep `www` as the primary domain. That matches the current
canonical URL and Netlify's advice for external DNS.

## 2. Wix transfer-out

[Wix: Transferring Your Wix Domain Away from Wix](https://support.wix.com/en/article/transferring-your-wix-domain-away-from-wix-2477749)

- Before you start: the domain must be unlocked, Private Registration should be
  turned off so transfer emails aren't missed, and the DNS records should be
  exported.
- Steps: Domains > Domain Actions > *Transfer away from Wix* > *Transfer Domain*
  > *I Still Want to Transfer*. Wix emails the EPP code to the registrant
  contact address.
- Who can do it: the site owner, or an Admin co-owner who owns the payment
  method for the domain subscription.
- After the transfer, the Wix site is disconnected from the domain, and "DNS
  settings ... are handled by the new host". Wix's DNS zone shouldn't be relied
  on after the transfer.
- Timing: usually up to 7 days. Wix can't track it once the new host has
  started. WHOIS shows "pending transfer".
- 60-day rules: no transfer within 60 days of purchase, of a registrant contact
  change, or of a previous transfer. Wix can't lift these, and it advises
  transferring *before* changing contact information.
  [Wix: ICANN's 60 Day Lock Policy](https://support.wix.com/en/article/icanns-60-day-lock-policy)
  The domain is more than four years old, so only a contact change could
  trigger the lock.
- **Wix plan during the transfer:** none of the Wix transfer articles requires
  an active Premium plan. The plan and the domain are "separate services and
  therefore need to be canceled separately".
  [Wix: Canceling Your Site Plan and Domain](https://support.wix.com/en/article/does-cancelling-my-premium-plan-also-cancel-my-domain-name)

Keeping DNS at Wix but using another DNS provider is supported: unassign the
domain from the site, export the records, then Manage DNS records > Nameservers
> *Use custom nameservers*. Wix asks for two nameservers ("Wix requires both
nameservers"). After the switch, "Wix no longer manages your domain's DNS", and
*Reset to Wix* switches back.
[Wix: Changing Nameserver (NS) Records for a Wix Domain](https://support.wix.com/en/article/changing-nameserver-ns-records-for-a-wix-domain)

## 3. Gandi transfer-in (.org)

- Price: transfer EUR 15.20, registration from EUR 15.20/yr, renewal EUR
  31.98/yr. All excluding VAT, payable in EUR, GBP or USD. The transfer adds the
  minimum renewal term. Average processing time is 1 to 10 days, and the domain
  must be at least 60 days old.
  [Gandi: .org domain names](https://www.gandi.net/en/domain/tld/org)
- .org uses an auth code. The new expiry is "1 year after current expiration
  date", so 2029-03-20.
  [Gandi: Transfer Procedures](https://docs.gandi.net/en/domain_names/transfer/transfer_table.html)
- Process: unlock and get the code at the old registrar, start the transfer on
  Gandi, enter the code and the owner contact, approve the confirmation email.
  Afterwards the owner must accept a final invitation email, or the domain won't
  show up in the Gandi account.
  **DNS:** "By default ... we will keep your current domain name settings during
  the transfer". Gandi warns that "if your former registrar/web host stops their
  DNS service once the domain leaves their services, then your domain will be
  offline". A *custom technical configuration* at checkout can set new
  nameservers or records instead.
  [Gandi: How to Transfer a Domain to Gandi](https://docs.gandi.net/en/domain_names/transfer/description.html)
- Readiness checklist: the registrant must be "clearly visible in the whois",
  the admin email must be valid, and the domain must not have been transferred
  in the last 60 days.
  [Gandi: Is Your Domain Ready for a Transfer?](https://docs.gandi.net/en/domain_names/transfer/tips.html)
- If the confirmation link isn't clicked, the transfer is accepted
  automatically 5 days after it starts.
  [Gandi: Transfer FAQ](https://docs.gandi.net/en/domain_names/faq/transfers.html)
- After the transfer, nameservers are set under Domain > Nameservers > Change:
  *External* (for example Netlify's) or *Gandi's LiveDNS*. Switching to LiveDNS
  can reproduce the current records. Allow 12 to 24 hours.
  [Gandi: How to Change My Nameserver](https://docs.gandi.net/en/domain_names/common_operations/changing_nameservers.html)

I found no Gandi doc on preparing a LiveDNS zone for a domain that isn't yet
registered at Gandi. LiveDNS can therefore only be set up at checkout (custom
technical configuration) or after the transfer.

## 4. Netlify DNS as the DNS host

- For a domain registered elsewhere, copy existing records to Netlify DNS
  first "to ensure continuous service". Then replace the registrar's
  nameservers with the ones listed for the domain in Netlify (four, in the form
  `dns1.p0X.nsone.net`). Allow up to a day.
  [Netlify: Set up Netlify DNS](https://docs.netlify.com/manage/domains/set-up-netlify-dns/),
  [Netlify name servers](https://docs.netlify.com/manage/domains/configure-domains/netlify-name-servers/)
- Netlify DNS doesn't support DNSSEC. apeciied.org is unsigned, so this is fine.
  [Netlify: Troubleshoot SSL and HTTPS](https://docs.netlify.com/manage/domains/troubleshooting/troubleshoot-ssl-and-https/)

There are three reasons to prefer it here. DNS stops depending on the registrar,
so the transfer can't cause a DNS gap. The apex gets Netlify's own record type
instead of a fixed IP. And Netlify provisions a wildcard certificate. The cost
is that DNS is tied to the web host: leaving Netlify later means moving DNS too.

## 5. HTTPS across the changes

- Netlify provisions and renews Let's Encrypt certificates automatically for
  custom domains. DNS must be configured in advance for every alias the
  certificate should cover. With Netlify DNS, Netlify also provisions a wildcard
  certificate.
  [Netlify: HTTPS (SSL)](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/)
- The certificate needs "100% correct DNS records propagated globally". While
  old Wix A records are still cached (TTL 3600), issuance can fail and retry.
  [Netlify: Troubleshoot SSL and HTTPS](https://docs.netlify.com/manage/domains/troubleshooting/troubleshoot-ssl-and-https/)
- **The launch cutover is the only real HTTPS gap.** Expect up to about an
  hour, the A record TTL, of mixed answers before the certificate is issued.
  Some visitors may reach Wix's "not connected" page (the domain is unassigned)
  or get a certificate warning on Netlify.
- **No gap from the nameserver move.** When the nameservers move from Wix DNS
  to Netlify DNS, both zones send traffic to the same Netlify site, so the
  existing certificate stays valid. Netlify's docs don't describe this case;
  this is an inference from how DNS and the certificate work.
- The registrar transfer doesn't change DNS answers, so it doesn't affect
  HTTPS.

## 6. When to cancel Wix

- Cancelling the Premium plan "does not cancel any domain, business email, or
  app subscriptions". After the 14-day window, the plan stays active to the end
  of its billing cycle and doesn't renew. Renewal can happen up to 3 weeks
  before expiry. The Wix site stays online on its free URL with ads, and its
  content isn't deleted.
  [Wix: Canceling a Wix Premium or Studio Plan](https://support.wix.com/en/article/canceling-a-wix-premium-plan)
- Cancelling the Wix *domain* only turns off auto-renew; you keep the domain to
  the end of the subscription. Domain purchases aren't refundable.
  [Wix: Canceling Your Domain](https://support.wix.com/en/article/canceling-a-wix-domain)
- Nothing in Wix's docs ties the plan to the ability to transfer, and
  cancelling neither releases nor locks the domain. The plan only matters while
  the domain is assigned to the Wix site. Cancelling last, as agreed, is the
  conservative choice and costs nothing as long as it happens before the plan's
  next renewal charge.
- After launch, consider unpublishing the Wix site
  ([Wix Editor: Unpublishing Your Site](https://support.wix.com/en/article/wix-editor-unpublishing-your-site)).
  Otherwise a duplicate copy stays live on the free `wixsite.com` URL.

## Recommended sequence

1. **Prep.** In Wix, export the DNS zone (BIND) as a backup. Note the renewal
   dates of the Premium plan and the domain subscription. Don't change any
   contact details yet.
2. **Netlify.** Deploy the site, then add `www.apeciied.org` (the apex is added
   automatically) and make `www` primary.
3. **Launch, in one sitting.** In Wix, unassign the domain from the Wix site.
   In Manage DNS Records, delete the three apex A records, add `A @ 75.2.60.5`,
   and change the `www` CNAME to `<site>.netlify.app`. Watch Domain management >
   HTTPS until the certificate is issued, and check with `dig`. (Alternative:
   skip this and do step 4 directly as the launch. That is one cutover instead
   of two, with the same short gap.)
4. **Move DNS off Wix, before the transfer.** In Netlify, set up Netlify DNS for
   apeciied.org and confirm the zone serves the apex and `www` for the site. In
   Wix, *Use custom nameservers* with two of Netlify's four nameservers. Wait 24
   to 48 hours and confirm `dig NS apeciied.org` shows the `nsone.net` servers.
5. **Start the transfer.** In Wix, turn off Private Registration, then
   *Transfer away from Wix* and collect the EPP code from the registrant email.
   Check `whois` shows `clientTransferProhibited` gone. On Gandi, order the
   transfer (about EUR 15.20 + VAT), enter the code and the owner contact, and
   **keep the current nameservers**: don't apply a custom technical
   configuration. Approve the confirmation email, then accept Gandi's invitation
   email once the transfer completes (1 to 10 days).
6. **Finish at Gandi.** Under Nameservers > External, enter all four Netlify
   nameservers. Confirm the expiry reads 2029-03-20, turn on auto-renew, and
   re-enable the transfer lock or privacy as Gandi offers.
7. **Close Wix.** Cancel the Premium plan, and the Wix domain subscription if it
   is still listed. Optionally unpublish the Wix site.

**If the maintainer still wants Gandi LiveDNS:** do steps 1 to 6 as above, so
the transfer runs with Netlify DNS live. Then at Gandi, switch the nameservers
to LiveDNS with `www` CNAME `<site>.netlify.app` and the apex as A `75.2.60.5`
(or ALIAS to `apex-loadbalancer.netlify.com`, if LiveDNS offers it; not
checked). Both zones point at the same site, so the switch has no gap.

## Open uncertainties

- **Where Wix unlocks the domain.** Wix says the domain must be unlocked but I
  found no unlock control in its docs. The *Transfer away from Wix* flow most
  likely removes `clientTransferProhibited`; check `whois` after requesting the
  code.
- **Whether turning off Private Registration counts as a registrant change.**
  Wix doesn't list which changes start the 60-day lock, and both Wix and Gandi
  ask for privacy to be off. If Wix reports a lock, the domain can stay on
  Netlify DNS at Wix until the lock ends, so it causes no downtime. ICANN is
  reviewing a Transfer Policy change that drops the post-change-of-registrant
  lock; no effective date was confirmed
  ([ICANN Transfer Policy](https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy)).
- **Whether Wix accepts more than two custom nameservers.** The doc says two.
  Two of Netlify's four nameservers is enough to run on until Gandi takes all
  four.
- **The `www` reservation in Wix's DNS editor.** It probably only applies while
  the domain is assigned to a Wix site, but this isn't stated. If Wix blocks the
  `www` CNAME edit, go straight to step 4 for the launch.
- **Gandi prices** are the list prices on 2026-11-22 and can change. Confirm at
  checkout.
