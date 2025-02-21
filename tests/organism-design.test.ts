import { describe, it, beforeEach, expect } from "vitest"

describe("Organism Design Contract", () => {
  let mockStorage: Map<string, any>
  let nextDesignId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextDesignId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "create-design":
        const [name, description] = args
        nextDesignId++
        mockStorage.set(`design-${nextDesignId}`, {
          name,
          description,
          contributors: [sender],
          gene_sequences: [],
        })
        return { success: true, value: nextDesignId }
      
      case "add-contributor":
        const [addContributorDesignId, contributor] = args
        const addContributorDesign = mockStorage.get(`design-${addContributorDesignId}`)
        if (!addContributorDesign) return { success: false, error: 404 }
        if (addContributorDesign.contributors[0] !== sender) return { success: false, error: 403 }
        addContributorDesign.contributors.push(contributor)
        mockStorage.set(`design-${addContributorDesignId}`, addContributorDesign)
        return { success: true }
      
      case "add-gene-sequence":
        const [addSequenceDesignId, sequenceId] = args
        const addSequenceDesign = mockStorage.get(`design-${addSequenceDesignId}`)
        if (!addSequenceDesign) return { success: false, error: 404 }
        if (!addSequenceDesign.contributors.includes(sender)) return { success: false, error: 403 }
        addSequenceDesign.gene_sequences.push(sequenceId)
        mockStorage.set(`design-${addSequenceDesignId}`, addSequenceDesign)
        return { success: true }
      
      case "get-design":
        return { success: true, value: mockStorage.get(`design-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should create an organism design", () => {
    const result = mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should add a contributor", () => {
    mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    const result = mockContractCall("add-contributor", [1, "user2"], "user1")
    expect(result.success).toBe(true)
    const design = mockContractCall("get-design", [1], "anyone").value
    expect(design.contributors).toContain("user2")
  })
  
  it("should add a gene sequence", () => {
    mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    const result = mockContractCall("add-gene-sequence", [1, 1], "user1")
    expect(result.success).toBe(true)
    const design = mockContractCall("get-design", [1], "anyone").value
    expect(design.gene_sequences).toContain(1)
  })
  
  it("should not add contributor if not the creator", () => {
    mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    const result = mockContractCall("add-contributor", [1, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should not add gene sequence if not a contributor", () => {
    mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    const result = mockContractCall("add-gene-sequence", [1, 1], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should get design information", () => {
    mockContractCall("create-design", ["E. coli 2.0", "Enhanced E. coli strain"], "user1")
    const result = mockContractCall("get-design", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      name: "E. coli 2.0",
      description: "Enhanced E. coli strain",
      contributors: ["user1"],
      gene_sequences: [],
    })
  })
})

