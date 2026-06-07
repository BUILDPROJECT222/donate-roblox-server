-- Taruh di StarterPlayerScripts atau StarterGui

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Buat ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "DonationGui"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 100
screenGui.Parent = playerGui

-- Container untuk notifikasi (kanan atas)
local container = Instance.new("Frame")
container.Name = "Container"
container.Size = UDim2.new(0, 350, 1, 0)
container.Position = UDim2.new(1, -370, 0, 20)
container.BackgroundTransparency = 1
container.Parent = screenGui

local layout = Instance.new("UIListLayout")
layout.SortOrder = Enum.SortOrder.LayoutOrder
layout.Padding = UDim.new(0, 10)
layout.VerticalAlignment = Enum.VerticalAlignment.Top
layout.Parent = container

local function formatRupiah(amount)
	local formatted = tostring(amount)
	local k
	while true do
		formatted, k = string.gsub(formatted, "^(-?%d+)(%d%d%d)", "%1.%2")
		if k == 0 then break end
	end
	return "Rp" .. formatted
end

local function showNotification(donation)
	local name = donation.name or "Anonim"
	local amount = donation.amount or 0
	local message = donation.message or ""

	-- Card utama
	local card = Instance.new("Frame")
	card.Size = UDim2.new(1, 0, 0, 90)
	card.BackgroundColor3 = Color3.fromRGB(30, 30, 40)
	card.BorderSizePixel = 0
	card.BackgroundTransparency = 1
	card.Parent = container

	local cardCorner = Instance.new("UICorner")
	cardCorner.CornerRadius = UDim.new(0, 12)
	cardCorner.Parent = card

	local cardStroke = Instance.new("UIStroke")
	cardStroke.Color = Color3.fromRGB(255, 180, 50)
	cardStroke.Thickness = 2
	cardStroke.Transparency = 1
	cardStroke.Parent = card

	local padding = Instance.new("UIPadding")
	padding.PaddingLeft = UDim.new(0, 14)
	padding.PaddingRight = UDim.new(0, 14)
	padding.PaddingTop = UDim.new(0, 10)
	padding.PaddingBottom = UDim.new(0, 10)
	padding.Parent = card

	-- Header: nama + jumlah
	local header = Instance.new("TextLabel")
	header.Size = UDim2.new(1, 0, 0, 22)
	header.Position = UDim2.new(0, 0, 0, 0)
	header.BackgroundTransparency = 1
	header.Text = "💰 " .. name .. " donasi " .. formatRupiah(amount)
	header.TextColor3 = Color3.fromRGB(255, 200, 60)
	header.TextSize = 18
	header.Font = Enum.Font.GothamBold
	header.TextXAlignment = Enum.TextXAlignment.Left
	header.TextTruncate = Enum.TextTruncate.AtEnd
	header.Parent = card

	-- Pesan
	if message ~= "" then
		local msgLabel = Instance.new("TextLabel")
		msgLabel.Size = UDim2.new(1, 0, 0, 40)
		msgLabel.Position = UDim2.new(0, 0, 0, 28)
		msgLabel.BackgroundTransparency = 1
		msgLabel.Text = '"' .. message .. '"'
		msgLabel.TextColor3 = Color3.fromRGB(220, 220, 230)
		msgLabel.TextSize = 14
		msgLabel.Font = Enum.Font.Gotham
		msgLabel.TextXAlignment = Enum.TextXAlignment.Left
		msgLabel.TextYAlignment = Enum.TextYAlignment.Top
		msgLabel.TextWrapped = true
		msgLabel.TextTruncate = Enum.TextTruncate.AtEnd
		msgLabel.Parent = card
	end

	-- Animasi masuk (slide + fade in)
	local tweenInfo = TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
	card.Position = UDim2.new(1, 50, 0, 0)

	TweenService:Create(card, tweenInfo, {
		BackgroundTransparency = 0.1,
		Position = UDim2.new(0, 0, 0, 0),
	}):Play()

	TweenService:Create(cardStroke, tweenInfo, {
		Transparency = 0,
	}):Play()

	-- Hapus setelah 6 detik (fade out)
	task.delay(6, function()
		local fadeInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
		TweenService:Create(card, fadeInfo, {
			BackgroundTransparency = 1,
			Position = UDim2.new(1, 50, 0, 0),
		}):Play()
		TweenService:Create(cardStroke, fadeInfo, { Transparency = 1 }):Play()
		TweenService:Create(header, fadeInfo, { TextTransparency = 1 }):Play()

		local msgLabel = card:FindFirstChild("TextLabel")
		if msgLabel and msgLabel ~= header then
			TweenService:Create(msgLabel, fadeInfo, { TextTransparency = 1 }):Play()
		end

		task.wait(0.6)
		card:Destroy()
	end)
end

-- Listen untuk donasi dari server
local donationEvent = ReplicatedStorage:WaitForChild("DonationEvent")
donationEvent.OnClientEvent:Connect(showNotification)
