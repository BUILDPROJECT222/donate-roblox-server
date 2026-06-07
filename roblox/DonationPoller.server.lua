-- Taruh di ServerScriptService
-- Pastikan HttpService sudah di-enable di Game Settings > Security

local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Ganti dengan URL server kamu (Railway/Render/dll)
local SERVER_URL = "http://localhost:3000"
local POLL_INTERVAL = 4 -- detik

-- Buat RemoteEvent untuk kirim donasi ke semua client
local donationEvent = Instance.new("RemoteEvent")
donationEvent.Name = "DonationEvent"
donationEvent.Parent = ReplicatedStorage

local function pollDonations()
	local success, result = pcall(function()
		local response = HttpService:GetAsync(SERVER_URL .. "/donations/latest")
		return HttpService:JSONDecode(response)
	end)

	if success and result and result.donations then
		for _, donation in ipairs(result.donations) do
			print(("[Donasi] %s - Rp%s: %s"):format(
				donation.name or "Anonim",
				tostring(donation.amount or 0),
				donation.message or ""
			))
			-- Kirim ke semua client
			donationEvent:FireAllClients(donation)
		end
	elseif not success then
		warn("[DonationPoller] Gagal poll: " .. tostring(result))
	end
end

-- Loop polling
while true do
	pollDonations()
	task.wait(POLL_INTERVAL)
end
