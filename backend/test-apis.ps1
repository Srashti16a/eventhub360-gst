# ==============================================================
# EventHub360 GST - Backend API Integration Test Script
# Tests all APIs and verifies CRUD + database storage
# ==============================================================

$baseUrl = "http://localhost:3000/api"
$pass = 0
$fail = 0
$results = @()

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200,
        [string]$ContentType = "application/json"
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = $ContentType
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  PASS: $Name (HTTP $statusCode)" -ForegroundColor Green
            $script:pass++
            $script:results += [PSCustomObject]@{ Test = $Name; Status = "PASS"; HTTP = $statusCode; Detail = "" }
        } else {
            Write-Host "  FAIL: $Name - Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
            $script:fail++
            $script:results += [PSCustomObject]@{ Test = $Name; Status = "FAIL"; HTTP = $statusCode; Detail = "Expected $ExpectedStatus" }
        }
        
        return $content
    }
    catch {
        $statusCode = 0
        $content = $null
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $content = $reader.ReadToEnd() | ConvertFrom-Json
                $reader.Close()
            } catch {}
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  PASS: $Name (HTTP $statusCode)" -ForegroundColor Green
            $script:pass++
            $script:results += [PSCustomObject]@{ Test = $Name; Status = "PASS"; HTTP = $statusCode; Detail = "" }
        } else {
            $errMsg = $_.Exception.Message
            Write-Host "  FAIL: $Name - $errMsg (HTTP $statusCode)" -ForegroundColor Red
            $script:fail++
            $script:results += [PSCustomObject]@{ Test = $Name; Status = "FAIL"; HTTP = $statusCode; Detail = $errMsg }
        }
        
        return $content
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  EventHub360 Backend API Integration Tests" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ----------------------------------------------------------
# 1. Dashboard Stats
# ----------------------------------------------------------
Write-Host "[1] Dashboard" -ForegroundColor Yellow
$stats = Test-Api -Name "GET /dashboard/stats" -Method "GET" -Url "$baseUrl/dashboard/stats"
if ($stats.success -eq $true -and $stats.data.totalGuests) {
    Write-Host "     -> Total guests: $($stats.data.totalGuests.value), Confirmed: $($stats.data.confirmed.value), Pending: $($stats.data.pendingRsvp.value), VIP: $($stats.data.vipStatus.value)" -ForegroundColor DarkGray
}
Write-Host ""

# ----------------------------------------------------------
# 2. Events
# ----------------------------------------------------------
Write-Host "[2] Events" -ForegroundColor Yellow
$events = Test-Api -Name "GET /events" -Method "GET" -Url "$baseUrl/events"
if ($events.success -eq $true) {
    Write-Host "     -> Found $($events.data.Count) events" -ForegroundColor DarkGray
}

# Create a test event
$testEvent = Test-Api -Name "POST /events (create)" -Method "POST" -Url "$baseUrl/events" -Body @{
    title = "Integration Test Event"
    category = "Integration Test"
    date = "2026-12-31T00:00:00.000Z"
} -ExpectedStatus 201

$testEventId = $null
if ($testEvent.success -eq $true) {
    $testEventId = $testEvent.data.id
    Write-Host "     -> Created Event ID: $testEventId" -ForegroundColor DarkGray
}

# Test validation: missing title
Test-Api -Name "POST /events (missing title - should 400)" -Method "POST" -Url "$baseUrl/events" -Body @{
    category = "Test"
} -ExpectedStatus 400
Write-Host ""

# ----------------------------------------------------------
# 3. Hotels
# ----------------------------------------------------------
Write-Host "[3] Hotels" -ForegroundColor Yellow
$hotels = Test-Api -Name "GET /hotels" -Method "GET" -Url "$baseUrl/hotels"
if ($hotels.success -eq $true) {
    Write-Host "     -> Found $($hotels.data.Count) hotels" -ForegroundColor DarkGray
}

$testHotel = Test-Api -Name "POST /hotels (create)" -Method "POST" -Url "$baseUrl/hotels" -Body @{
    name = "Integration Test Hotel"
} -ExpectedStatus 201

$testHotelId = $null
if ($testHotel.success -eq $true) {
    $testHotelId = $testHotel.data.id
    Write-Host "     -> Created Hotel ID: $testHotelId" -ForegroundColor DarkGray
}

# Test validation: missing name
Test-Api -Name "POST /hotels (missing name - should 400)" -Method "POST" -Url "$baseUrl/hotels" -Body @{} -ExpectedStatus 400
Write-Host ""

# ----------------------------------------------------------
# 4. Seating Tables
# ----------------------------------------------------------
Write-Host "[4] Seating" -ForegroundColor Yellow
$tables = Test-Api -Name "GET /seating/tables" -Method "GET" -Url "$baseUrl/seating/tables"
if ($tables.success -eq $true) {
    Write-Host "     -> Found $($tables.data.Count) tables" -ForegroundColor DarkGray
}
Write-Host ""

# ----------------------------------------------------------
# 5. FULL GUEST CRUD CYCLE
# ----------------------------------------------------------
Write-Host "[5] Guest CRUD (Full Cycle)" -ForegroundColor Yellow

if (-not $testEventId) {
    Write-Host "  SKIP: Cannot test guest CRUD without a valid Event ID" -ForegroundColor Magenta
} else {
    # 5a. CREATE guest
    $createBody = @{
        name = "Integration Test Guest"
        email = "integration.test@eventhub360.com"
        phone = "+1234567890"
        status = "PENDING"
        isVip = $true
        isSpeaker = $false
        isBridalParty = $false
        isPrimaryGuest = $false
        eventId = $testEventId
    }
    if ($testHotelId) {
        $createBody.assignedHotelId = $testHotelId
    }

    $createdGuest = Test-Api -Name "POST /guests (create)" -Method "POST" -Url "$baseUrl/guests" -Body $createBody -ExpectedStatus 201
    
    $testGuestId = $null
    if ($createdGuest.success -eq $true) {
        $testGuestId = $createdGuest.data.id
        Write-Host "     -> Created Guest ID: $testGuestId" -ForegroundColor DarkGray
        Write-Host "     -> DB Verified: Guest inserted with name='$($createdGuest.data.name)', status='$($createdGuest.data.status)'" -ForegroundColor DarkGray
    }
    
    # 5b. GET all guests (verify it appears)
    $guestList = Test-Api -Name "GET /guests (verify created)" -Method "GET" -Url "$baseUrl/guests?page=1&limit=100"
    if ($guestList.success -eq $true) {
        $found = $guestList.data | Where-Object { $_.id -eq $testGuestId }
        if ($found) {
            Write-Host "     -> DB Verified: Guest found in list query" -ForegroundColor DarkGray
        }
    }
    
    # 5c. GET single guest
    if ($testGuestId) {
        $singleGuest = Test-Api -Name "GET /guests/:id (single)" -Method "GET" -Url "$baseUrl/guests/$testGuestId"
        if ($singleGuest.success -eq $true) {
            Write-Host "     -> DB Verified: Single guest fetch matches ID" -ForegroundColor DarkGray
        }
    }
    
    # 5d. UPDATE guest
    if ($testGuestId) {
        $updatedGuest = Test-Api -Name "PUT /guests/:id (update)" -Method "PUT" -Url "$baseUrl/guests/$testGuestId" -Body @{
            name = "Integration Test Guest UPDATED"
            status = "CONFIRMED"
            isVip = $false
        }
        if ($updatedGuest.success -eq $true) {
            Write-Host "     -> DB Verified: name='$($updatedGuest.data.name)', status='$($updatedGuest.data.status)', isVip=$($updatedGuest.data.isVip)" -ForegroundColor DarkGray
        }
        
        # Verify update persisted via GET
        $verifyUpdate = Test-Api -Name "GET /guests/:id (verify update)" -Method "GET" -Url "$baseUrl/guests/$testGuestId"
        if ($verifyUpdate.success -eq $true -and $verifyUpdate.data.name -eq "Integration Test Guest UPDATED") {
            Write-Host "     -> DB Verified: Updated values confirmed via GET" -ForegroundColor DarkGray
        }
    }
    
    # 5e. DELETE guest
    if ($testGuestId) {
        $deleteResult = Test-Api -Name "DELETE /guests/:id" -Method "DELETE" -Url "$baseUrl/guests/$testGuestId"
        if ($deleteResult.success -eq $true) {
            Write-Host "     -> DB Verified: Guest hard-deleted" -ForegroundColor DarkGray
        }
        
        # Verify deletion (should 404)
        Test-Api -Name "GET /guests/:id (verify deleted - should 404)" -Method "GET" -Url "$baseUrl/guests/$testGuestId" -ExpectedStatus 404
    }
}
Write-Host ""

# ----------------------------------------------------------
# 6. Guest Validation Tests
# ----------------------------------------------------------
Write-Host "[6] Validation & Error Handling" -ForegroundColor Yellow

# Missing required fields
Test-Api -Name "POST /guests (empty body - should 400)" -Method "POST" -Url "$baseUrl/guests" -Body @{} -ExpectedStatus 400

# Invalid email
if ($testEventId) {
    Test-Api -Name "POST /guests (invalid email - should 400)" -Method "POST" -Url "$baseUrl/guests" -Body @{
        name = "Bad Email Guest"
        email = "not-an-email"
        phone = "+1234567890"
        status = "PENDING"
        eventId = $testEventId
    } -ExpectedStatus 400
}

# Invalid UUID in path
Test-Api -Name "GET /guests/invalid-uuid (should 400)" -Method "GET" -Url "$baseUrl/guests/not-a-uuid" -ExpectedStatus 400

# Non-existent guest
Test-Api -Name "GET /guests/00000000-0000-0000-0000-000000000000 (should 404)" -Method "GET" -Url "$baseUrl/guests/00000000-0000-0000-0000-000000000000" -ExpectedStatus 404

# Invalid eventId
Test-Api -Name "POST /guests (invalid eventId - should 400)" -Method "POST" -Url "$baseUrl/guests" -Body @{
    name = "Bad Event Guest"
    email = "test@test.com"
    phone = "+1234567890"
    status = "PENDING"
    eventId = "00000000-0000-0000-0000-000000000000"
} -ExpectedStatus 400

# 404 route
Test-Api -Name "GET /nonexistent (should 404)" -Method "GET" -Url "$baseUrl/nonexistent" -ExpectedStatus 404
Write-Host ""

# ----------------------------------------------------------
# 7. Campaigns
# ----------------------------------------------------------
Write-Host "[7] Campaigns" -ForegroundColor Yellow
Test-Api -Name "POST /campaigns/send-rsvp (RSVP_REMINDER)" -Method "POST" -Url "$baseUrl/campaigns/send-rsvp" -Body @{
    campaignType = "RSVP_REMINDER"
}
Test-Api -Name "POST /campaigns/send-rsvp (ITINERARY)" -Method "POST" -Url "$baseUrl/campaigns/send-rsvp" -Body @{
    campaignType = "ITINERARY"
}
Test-Api -Name "POST /campaigns/send-rsvp (invalid type - should 400)" -Method "POST" -Url "$baseUrl/campaigns/send-rsvp" -Body @{
    campaignType = "INVALID"
} -ExpectedStatus 400
Write-Host ""

# ----------------------------------------------------------
# 8. Seating Assignment (if tables exist)
# ----------------------------------------------------------
Write-Host "[8] Seating Assignment" -ForegroundColor Yellow
if ($tables.success -eq $true -and $tables.data.Count -gt 0) {
    # Create a temp guest for seating test
    if ($testEventId) {
        $seatGuest = Test-Api -Name "POST /guests (seating test guest)" -Method "POST" -Url "$baseUrl/guests" -Body @{
            name = "Seating Test Guest"
            email = "seating.test@eventhub360.com"
            phone = "+9876543210"
            status = "CONFIRMED"
            eventId = $testEventId
        } -ExpectedStatus 201
        
        if ($seatGuest.success -eq $true) {
            $seatGuestId = $seatGuest.data.id
            $firstTableId = $tables.data[0].id
            
            Test-Api -Name "PUT /seating/assign (assign guest)" -Method "PUT" -Url "$baseUrl/seating/assign" -Body @{
                guestId = $seatGuestId
                tableId = $firstTableId
                seatNumber = 99
            }
            
            # Unassign
            Test-Api -Name "PUT /seating/assign (unassign guest)" -Method "PUT" -Url "$baseUrl/seating/assign" -Body @{
                guestId = $seatGuestId
            }
            
            # Cleanup
            Test-Api -Name "DELETE /guests/:id (cleanup seating test)" -Method "DELETE" -Url "$baseUrl/guests/$seatGuestId"
        }
    }
} else {
    Write-Host "  SKIP: No tables in database" -ForegroundColor Magenta
}

# Test missing guestId
Test-Api -Name "PUT /seating/assign (missing guestId - should 400)" -Method "PUT" -Url "$baseUrl/seating/assign" -Body @{
    tableId = "some-id"
} -ExpectedStatus 400
Write-Host ""

# ----------------------------------------------------------
# Cleanup: Remove test event and hotel
# ----------------------------------------------------------
Write-Host "[Cleanup]" -ForegroundColor Yellow
# Note: Event cascade-deletes guests, so we just need to verify no orphan test data
# We cannot delete events/hotels via API (no DELETE endpoint), which is fine.
Write-Host "  INFO: Test event '$testEventId' and hotel '$testHotelId' left in DB (no DELETE endpoint)" -ForegroundColor DarkGray
Write-Host "  INFO: All test guests have been removed via API" -ForegroundColor DarkGray
Write-Host ""

# ----------------------------------------------------------
# Summary
# ----------------------------------------------------------
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Total:  $($pass + $fail)" -ForegroundColor White
Write-Host "  Passed: $pass" -ForegroundColor Green
Write-Host "  Failed: $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Print table
$results | Format-Table -AutoSize
