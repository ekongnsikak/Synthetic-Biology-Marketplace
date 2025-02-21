import { describe, it, beforeEach, expect } from "vitest"

describe("Gene Sequence Contract", () => {
  let mockStorage: Map<string, any>
  let nextSequenceId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextSequenceId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-sequence":
        const [sequence] = args
        nextSequenceId++
        mockStorage.set(`sequence-${nextSequenceId}`, {
          owner: sender,
          sequence,
          is_licensed: false,
        })
        return { success: true, value: nextSequenceId }
      
      case "license-sequence":
        const [licenseSequenceId] = args
        const licenseSequence = mockStorage.get(`sequence-${licenseSequenceId}`)
        if (!licenseSequence) return { success: false, error: 404 }
        if (licenseSequence.owner !== sender) return { success: false, error: 403 }
        licenseSequence.is_licensed = true
        mockStorage.set(`sequence-${licenseSequenceId}`, licenseSequence)
        return { success: true }
      
      case "transfer-ownership":
        const [transferSequenceId, newOwner] = args
        const transferSequence = mockStorage.get(`sequence-${transferSequenceId}`)
        if (!transferSequence) return { success: false, error: 404 }
        if (transferSequence.owner !== sender) return { success: false, error: 403 }
        transferSequence.owner = newOwner
        mockStorage.set(`sequence-${transferSequenceId}`, transferSequence)
        return { success: true }
      
      case "get-sequence":
        return { success: true, value: mockStorage.get(`sequence-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register a gene sequence", () => {
    const result = mockContractCall("register-sequence", ["ATCG"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should license a sequence", () => {
    mockContractCall("register-sequence", ["ATCG"], "user1")
    const result = mockContractCall("license-sequence", [1], "user1")
    expect(result.success).toBe(true)
    const sequence = mockContractCall("get-sequence", [1], "anyone").value
    expect(sequence.is_licensed).toBe(true)
  })
  
  it("should transfer ownership", () => {
    mockContractCall("register-sequence", ["ATCG"], "user1")
    const result = mockContractCall("transfer-ownership", [1, "user2"], "user1")
    expect(result.success).toBe(true)
    const sequence = mockContractCall("get-sequence", [1], "anyone").value
    expect(sequence.owner).toBe("user2")
  })
  
  it("should not license if not the owner", () => {
    mockContractCall("register-sequence", ["ATCG"], "user1")
    const result = mockContractCall("license-sequence", [1], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should not transfer if not the owner", () => {
    mockContractCall("register-sequence", ["ATCG"], "user1")
    const result = mockContractCall("transfer-ownership", [1, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get sequence information", () => {
    mockContractCall("register-sequence", ["ATCG"], "user1")
    const result = mockContractCall("get-sequence", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: "user1",
      sequence: "ATCG",
      is_licensed: false,
    })
  })
})

